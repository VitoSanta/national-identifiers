using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

/// <summary>
/// Company / entity tax identifiers with public check-digit algorithms.
/// Sourced from official documentation; see docs/COUNTRY-COVERAGE.md.
/// </summary>
internal static class CompanyTaxId
{
    private const string GstinAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static readonly Regex GstinPattern =
        new(@"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$", RegexOptions.Compiled);

    private static string Compact(object? value)
    {
        string? str = value switch
        {
            string s => s,
            int or long or double or float or decimal => value.ToString(),
            _ => null,
        };
        return str is null
            ? string.Empty
            : Regex.Replace(str.Trim(), @"[\s./-]+", string.Empty).ToUpperInvariant();
    }

    // Brazil CNPJ: 14 digits, two modulo-11 check digits over the first 12.
    internal static ValidationResult Brazil(object? value)
    {
        var n = Compact(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("BR", n, ValidationErrorCode.Empty);
        if (n.Length != 14) return ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{14}$") || Regex.IsMatch(n, @"^(\d)\1{13}$"))
            return ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidFormat);

        return n[12] - '0' == CnpjCheckDigit(n, 12) && n[13] - '0' == CnpjCheckDigit(n, 13)
            ? ValidationResult.Ok("BR", n, ValidationLevel.Checksum)
            : ValidationResult.Fail("BR", n, ValidationErrorCode.InvalidChecksum);
    }

    private static int CnpjCheckDigit(string n, int length)
    {
        var weight = length - 7;
        var sum = 0;
        for (var i = 0; i < length; i++)
        {
            sum += (n[i] - '0') * weight;
            weight = weight == 2 ? 9 : weight - 1;
        }
        var remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }

    // India GSTIN: 15 chars (state + PAN + entity + 'Z' + check), modulo-36 check.
    internal static ValidationResult India(object? value)
    {
        var n = Compact(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("IN", n, ValidationErrorCode.Empty);
        if (n.Length != 15) return ValidationResult.Fail("IN", n, ValidationErrorCode.InvalidLength);
        if (!GstinPattern.IsMatch(n)) return ValidationResult.Fail("IN", n, ValidationErrorCode.InvalidFormat);

        var factor = 2;
        var sum = 0;
        for (var i = 13; i >= 0; i--)
        {
            var codePoint = GstinAlphabet.IndexOf(n[i]);
            var addend = factor * codePoint;
            factor = factor == 2 ? 1 : 2;
            sum += addend / 36 + addend % 36;
        }
        var expected = GstinAlphabet[(36 - sum % 36) % 36];
        return n[14] == expected
            ? ValidationResult.Ok("IN", n, ValidationLevel.Checksum)
            : ValidationResult.Fail("IN", n, ValidationErrorCode.InvalidChecksum);
    }

    // Australia ACN: 9-digit company number, modulo-10 weighted check (ASIC).
    internal static ValidationResult Australia(object? value)
    {
        var n = Compact(value);
        if (string.IsNullOrEmpty(n)) return ValidationResult.Fail("AU", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return ValidationResult.Fail("AU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}$")) return ValidationResult.Fail("AU", n, ValidationErrorCode.InvalidFormat);

        int[] weights = [8, 7, 6, 5, 4, 3, 2, 1];
        var sum = 0;
        for (var i = 0; i < 8; i++) sum += (n[i] - '0') * weights[i];
        var expected = (10 - sum % 10) % 10;
        return n[8] - '0' == expected
            ? ValidationResult.Ok("AU", n, ValidationLevel.Checksum)
            : ValidationResult.Fail("AU", n, ValidationErrorCode.InvalidChecksum);
    }
}
