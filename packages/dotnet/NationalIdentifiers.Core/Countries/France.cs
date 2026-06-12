using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class France
{
    private static readonly Regex Pattern = new(@"^[0-3]\d{12}$", RegexOptions.Compiled);

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("FR", n, ValidationErrorCode.Empty);
        if (n.Length != 13) return ValidationResult.Fail("FR", n, ValidationErrorCode.InvalidLength);
        if (!Pattern.IsMatch(n)) return ValidationResult.Fail("FR", n, ValidationErrorCode.InvalidFormat);

        long first10 = long.Parse(n[..10]);
        string expected = (first10 % 511).ToString().PadLeft(3, '0');
        if (n[10..] != expected) return ValidationResult.Fail("FR", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("FR", n, ValidationLevel.Checksum);
    }
}
