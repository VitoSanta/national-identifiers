using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Pakistan
{
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("PK", n, ValidationErrorCode.Empty);
        if (n.Length != 7 && n.Length != 13) return ValidationResult.Fail("PK", n, ValidationErrorCode.InvalidLength);
        if (n.Length == 7)
        {
            if (!Regex.IsMatch(n, @"^\d{7}$") || n == "0000000")
                return ValidationResult.Fail("PK", n, ValidationErrorCode.InvalidFormat);
        }
        else
        {
            if (!Regex.IsMatch(n, @"^[1-9]\d{12}$"))
                return ValidationResult.Fail("PK", n, ValidationErrorCode.InvalidFormat);
        }
        return ValidationResult.Ok("PK", n, ValidationLevel.Format);
    }
}
