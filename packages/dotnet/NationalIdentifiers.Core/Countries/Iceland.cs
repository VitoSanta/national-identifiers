using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Iceland
{
    private static readonly int[] W = { 3,2,7,6,5,4,3,2 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IS", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("IS", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$")) return ValidationResult.Fail("IS", n, ValidationErrorCode.InvalidFormat);
        int[] d = n.Select(c => c - '0').ToArray();
        int dy = int.Parse(n[..2]); int mo = int.Parse(n[2..4]); int sy = int.Parse(n[4..6]);
        int century = d[9] == 0 ? 2000 : d[9] == 9 ? 1900 : 1800;
        if (!DateValidator.IsValidDate(century + sy, mo, dy)) return ValidationResult.Fail("IS", n, ValidationErrorCode.InvalidFormat);
        int sum = d.Take(8).Select((v, i) => v * W[i]).Sum();
        int rem = 11 - sum % 11;
        int exp = rem == 11 ? 0 : rem;
        if (exp == 10 || d[8] != exp) return ValidationResult.Fail("IS", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("IS", n, ValidationLevel.Checksum);
    }
}
