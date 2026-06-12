using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Lebanon
{
    internal static ValidationResult Validate(object? value)
    {
        var normalized = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(normalized))
            return ValidationResult.Fail("LB", normalized, ValidationErrorCode.Empty);

        var compact = Regex.Replace(value?.ToString()?.Trim() ?? string.Empty, @"\s+", string.Empty);
        if (!Regex.IsMatch(compact, @"^\d+(?:-(?:601|603|604))?$"))
            return ValidationResult.Fail("LB", normalized, ValidationErrorCode.InvalidFormat);

        return ValidationResult.Ok("LB", normalized, ValidationLevel.Format);
    }
}
