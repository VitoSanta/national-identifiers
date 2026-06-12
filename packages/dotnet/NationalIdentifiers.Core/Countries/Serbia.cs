namespace NationalIdentifiers.Core.Countries;
internal static class Serbia
{
    internal static ValidationResult Validate(object? value) =>
        JmbgHelper.Validate("RS", value, r => r <= 9 || r >= 70);
}
