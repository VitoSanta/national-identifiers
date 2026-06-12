namespace NationalIdentifiers.Core.Countries;
internal static class NorthMacedonia
{
    internal static ValidationResult Validate(object? value) =>
        JmbgHelper.Validate("MK", value, r => r == 4 || (r >= 40 && r <= 49));
}
