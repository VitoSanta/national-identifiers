namespace NationalIdentifiers.Core.Countries;
internal static class Montenegro
{
    internal static ValidationResult Validate(object? value) =>
        JmbgHelper.Validate("ME", value, r => r == 2 || (r >= 20 && r <= 29));
}
