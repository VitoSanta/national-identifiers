namespace NationalIdentifiers.Core.Countries;
internal static class VaticanCity
{
    internal static ValidationResult Validate(object? value) => NotApplicable.Validate("VA", value);
}
