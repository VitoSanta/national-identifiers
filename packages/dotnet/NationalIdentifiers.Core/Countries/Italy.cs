using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class Italy
{
    private static readonly Regex Pattern = new(
        @"^[A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST][0-9LMNPQRSTUV]{2}[A-Z][0-9LMNPQRSTUV]{3}[A-Z]$",
        RegexOptions.Compiled);

    private static readonly int[] OddValues = {
        1,0,5,7,9,13,15,17,19,21, // 0-9
        1,0,5,7,9,13,15,17,19,21,2,4,18,20,11,3,
        6,8,12,14,16,10,22,25,24,23 // A-Z
    };

    internal static ValidationResult Validate(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IT", n, ValidationErrorCode.Empty);
        if (n.Length == 11) return ValidateVatNumberNormalized(n);
        if (n.Length != 16) return ValidationResult.Fail("IT", n, ValidationErrorCode.InvalidLength);
        if (!Pattern.IsMatch(n)) return ValidationResult.Fail("IT", n, ValidationErrorCode.InvalidFormat);

        int sum = 0;
        for (int i = 0; i < 15; i++)
        {
            char c = n[i];
            int v = i % 2 == 0
                ? OddValues[c >= 'A' ? c - 'A' + 10 : c - '0']
                : (c >= 'A' ? c - 'A' : c - '0');
            sum += v;
        }
        char expected = (char)('A' + sum % 26);
        if (n[15] != expected) return ValidationResult.Fail("IT", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("IT", n, ValidationLevel.Checksum);
    }

    // Numeric tax IDs (partita IVA and the fiscal code assigned to legal
    // entities) share the same 11-digit layout and Luhn-style check digit.
    internal static ValidationResult ValidateVatNumber(object? value)
    {
        var n = TaxIdNormalizer.Normalize(value);
        if (string.IsNullOrEmpty(n))
            return ValidationResult.Fail("IT", n, ValidationErrorCode.Empty);
        if (n.Length != 11)
            return ValidationResult.Fail("IT", n, ValidationErrorCode.InvalidLength);
        return ValidateVatNumberNormalized(n);
    }

    private static ValidationResult ValidateVatNumberNormalized(string n)
    {
        if (!Regex.IsMatch(n, @"^\d{11}$") || n == "00000000000")
            return ValidationResult.Fail("IT", n, ValidationErrorCode.InvalidFormat);

        int sum = 0;
        for (int i = 0; i < 11; i++)
        {
            int digit = n[i] - '0';
            if (i % 2 == 0)
            {
                sum += digit;
                continue;
            }

            int doubled = digit * 2;
            sum += doubled > 9 ? doubled - 9 : doubled;
        }

        if (sum % 10 != 0) return ValidationResult.Fail("IT", n, ValidationErrorCode.InvalidChecksum);
        return ValidationResult.Ok("IT", n, ValidationLevel.Checksum);
    }
}
