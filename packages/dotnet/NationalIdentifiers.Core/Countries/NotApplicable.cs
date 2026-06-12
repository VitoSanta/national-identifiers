namespace NationalIdentifiers.Core.Countries;

internal static class NotApplicable
{
    internal static ValidationResult Validate(string country, object? value)
        => ValidationResult.Fail(country, TaxIdNormalizer.Normalize(value), ValidationErrorCode.NotApplicable);
}
