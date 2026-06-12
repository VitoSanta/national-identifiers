namespace NationalIdentifiers.Core.Countries;
internal static class Czechia
{
    internal static ValidationResult Validate(object? value) => BirthNumberHelper.Validate("CZ", value);
}
