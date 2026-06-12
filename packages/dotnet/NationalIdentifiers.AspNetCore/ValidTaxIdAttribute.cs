using System.ComponentModel.DataAnnotations;
using NationalIdentifiers.Core;
using DataAnnotationsValidationResult = System.ComponentModel.DataAnnotations.ValidationResult;

namespace NationalIdentifiers.AspNetCore;

/// <summary>Validates a property using the country code stored in a sibling property.</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field | AttributeTargets.Parameter)]
public sealed class ValidTaxIdAttribute : ValidationAttribute
{
    /// <summary>Creates an attribute linked to the named country property.</summary>
    public ValidTaxIdAttribute(string countryProperty)
    {
        if (string.IsNullOrWhiteSpace(countryProperty))
            throw new ArgumentException("A country property name is required.", nameof(countryProperty));

        CountryProperty = countryProperty;
    }

    /// <summary>Name of the sibling property containing an ISO country code.</summary>
    public string CountryProperty { get; }

    /// <inheritdoc />
    protected override DataAnnotationsValidationResult? IsValid(
        object? value,
        ValidationContext validationContext)
    {
        if (value is null || value is string text && string.IsNullOrWhiteSpace(text))
            return DataAnnotationsValidationResult.Success;

        var property = validationContext.ObjectType.GetProperty(CountryProperty);
        if (property is null)
        {
            return new DataAnnotationsValidationResult(
                $"Country property '{CountryProperty}' was not found.",
                new[] { validationContext.MemberName ?? string.Empty });
        }

        var country = property.GetValue(validationContext.ObjectInstance)?.ToString();
        if (string.IsNullOrWhiteSpace(country))
        {
            return new DataAnnotationsValidationResult(
                $"Country property '{CountryProperty}' is required.",
                new[] { validationContext.MemberName ?? string.Empty });
        }

        var validator = validationContext.GetService(typeof(ITaxIdValidator)) as ITaxIdValidator
            ?? new TaxIdValidator();
        var result = validator.Validate(country, value);

        if (result.IsValid)
            return DataAnnotationsValidationResult.Success;

        var message = ErrorMessage
            ?? $"Invalid tax identifier for {result.Country}: {result.Error}.";
        return new DataAnnotationsValidationResult(
            message,
            new[] { validationContext.MemberName ?? string.Empty });
    }
}
