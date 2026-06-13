using NationalIdentifiers.Core.Countries;

namespace NationalIdentifiers.Core;

internal static class TaxIdTerritoryValidator
{
    internal static ValidationResult Validate(string territory, object? value) =>
        territory switch
        {
            "FO" => Denmark.Validate(value) with { Country = "FO" },
            "GG" => CrownDependencies.ValidateGuernsey(value),
            "GL" => Denmark.Validate(value) with { Country = "GL" },
            "HK" => HongKong.Validate(value),
            "JE" => CrownDependencies.ValidateJersey(value),
            "PR" => UnitedStates.Validate(value) with { Country = "PR" },
            "TW" => Taiwan.Validate(value),
            _ => ValidationResult.Fail(
                territory,
                TaxIdNormalizer.Normalize(value),
                ValidationErrorCode.UnsupportedCountry)
        };
}
