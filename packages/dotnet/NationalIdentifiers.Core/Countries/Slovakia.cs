namespace NationalIdentifiers.Core.Countries;
internal static class Slovakia
{
    internal static ValidationResult Validate(object? value) => BirthNumberHelper.Validate("SK", value);
}
