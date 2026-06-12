namespace NationalIdentifiers.Core.Countries;
internal static class BosniaHerzegovina
{
    internal static ValidationResult Validate(object? value) =>
        JmbgHelper.Validate("BA", value, r => r == 1 || (r >= 10 && r <= 19));
}
