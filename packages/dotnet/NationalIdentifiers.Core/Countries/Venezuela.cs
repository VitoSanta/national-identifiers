using System.Text.RegularExpressions;
namespace NationalIdentifiers.Core.Countries;
internal static class Venezuela
{
    private static readonly int[] W = { 4, 3, 2, 7, 6, 5, 4, 3, 2 };
    private static readonly Dictionary<char, int> LM = new()
        { ['V']=1, ['E']=2, ['J']=3, ['C']=3, ['P']=4, ['G']=5 };
    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value).Replace(".", string.Empty, StringComparison.Ordinal);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("VE", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return ValidationResult.Fail("VE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[VEJPCG]\d{9}$"))
            return ValidationResult.Fail("VE", n, ValidationErrorCode.InvalidFormat);
        if (!LM.TryGetValue(n[0], out int lv))
            return ValidationResult.Fail("VE", n, ValidationErrorCode.InvalidFormat);
        int sum = lv * W[0];
        for (int i = 0; i < 8; i++) sum += (n[i + 1] - '0') * W[i + 1];
        int rem = sum % 11;
        int exp = rem <= 1 ? 0 : 11 - rem;
        if (n[9] - '0' != exp) return ValidationResult.Fail("VE", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("VE", n, ValidationLevel.Checksum);
    }
}
