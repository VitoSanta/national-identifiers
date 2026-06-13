using System.Globalization;
using System.Text.RegularExpressions;

namespace NationalIdentifiers.Core.Countries;

internal static class EuropeanVat
{
    internal static ValidationResult Croatia(object? value) =>
        global::NationalIdentifiers.Core.Countries.Croatia.Validate(
            WithoutPrefix(value, "HR"));

    internal static ValidationResult Greece(object? value) =>
        global::NationalIdentifiers.Core.Countries.Greece.Validate(
            WithoutPrefix(value, "EL", "GR"));

    internal static ValidationResult Italy(object? value) =>
        global::NationalIdentifiers.Core.Countries.Italy.ValidateVatNumber(
            WithoutPrefix(value, "IT"));

    internal static ValidationResult Portugal(object? value) =>
        global::NationalIdentifiers.Core.Countries.Portugal.Validate(
            WithoutPrefix(value, "PT"));

    internal static ValidationResult Ireland(object? value) =>
        global::NationalIdentifiers.Core.Countries.Ireland.Validate(
            WithoutPrefix(value, "IE"));

    internal static ValidationResult Austria(object? value)
    {
        var raw = Compact(value, "AT");
        var n = raw.StartsWith('U') ? raw[1..] : raw;
        if (string.IsNullOrEmpty(n)) return Fail("AT", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return Fail("AT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$")) return Fail("AT", n, ValidationErrorCode.InvalidFormat);
        var sum = 0;
        for (var index = 0; index < 7; index++)
        {
            var product = (n[index] - '0') * (index % 2 == 0 ? 1 : 2);
            sum += product / 10 + product % 10;
        }
        var expected = (10 - (sum + 4) % 10) % 10;
        return n[7] - '0' == expected
            ? Ok("AT", $"U{n}")
            : Fail("AT", $"U{n}", ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Belgium(object? value)
    {
        var n = Compact(value, "BE");
        if (string.IsNullOrEmpty(n)) return Fail("BE", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return Fail("BE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[01]\d{9}$")) return Fail("BE", n, ValidationErrorCode.InvalidFormat);
        var expected = 97 - int.Parse(n[..8], CultureInfo.InvariantCulture) % 97;
        return int.Parse(n[8..], CultureInfo.InvariantCulture) == expected
            ? Ok("BE", n)
            : Fail("BE", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Bulgaria(object? value)
    {
        var n = Compact(value, "BG");
        if (string.IsNullOrEmpty(n)) return Fail("BG", n, ValidationErrorCode.Empty);
        if (n.Length != 9 && n.Length != 10) return Fail("BG", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return Fail("BG", n, ValidationErrorCode.InvalidFormat);

        if (n.Length == 9)
        {
            // EIK / Bulstat (legal entity): two-pass modulo 11.
            var check = WeightedSum(n[..8], [1, 2, 3, 4, 5, 6, 7, 8]) % 11;
            if (check == 10)
            {
                check = WeightedSum(n[..8], [3, 4, 5, 6, 7, 8, 9, 10]) % 11;
                if (check == 10) check = 0;
            }
            return n[8] - '0' == check ? Ok("BG", n) : Fail("BG", n, ValidationErrorCode.InvalidChecksum);
        }

        // 10-digit sole trader: the check digit is the EGN check. Foreigner
        // (PNF) and miscellaneous variants are not covered (KNOWN-LIMITATIONS).
        var egn = WeightedSum(n[..9], [2, 4, 8, 5, 10, 9, 7, 3, 6]) % 11;
        if (egn == 10) egn = 0;
        return n[9] - '0' == egn ? Ok("BG", n) : Fail("BG", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Germany(object? value)
    {
        var n = Compact(value, "DE");
        if (string.IsNullOrEmpty(n)) return Fail("DE", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return Fail("DE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{8}$")) return Fail("DE", n, ValidationErrorCode.InvalidFormat);

        var product = 10;
        for (var index = 0; index < 8; index++)
        {
            var sum = (n[index] - '0' + product) % 10;
            if (sum == 0) sum = 10;
            product = 2 * sum % 11;
        }
        var expected = 11 - product;
        if (expected == 10) expected = 0;
        return n[8] - '0' == expected
            ? Ok("DE", n)
            : Fail("DE", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult France(object? value)
    {
        var n = Compact(value, "FR");
        if (string.IsNullOrEmpty(n)) return Fail("FR", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return Fail("FR", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$")) return Fail("FR", n, ValidationErrorCode.InvalidFormat);
        var siren = long.Parse(n[2..], CultureInfo.InvariantCulture);
        if (siren == 0) return Fail("FR", n, ValidationErrorCode.InvalidFormat);
        var expected = (12 + 3 * (siren % 97)) % 97;
        return int.Parse(n[..2], CultureInfo.InvariantCulture) == expected
            ? Ok("FR", n)
            : Fail("FR", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Netherlands(object? value)
    {
        var n = Compact(value, "NL");
        if (string.IsNullOrEmpty(n)) return Fail("NL", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return Fail("NL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{9}B\d{2}$")) return Fail("NL", n, ValidationErrorCode.InvalidFormat);
        var sum = 0;
        for (var index = 0; index < 9; index++)
            sum += (n[index] - '0') * (index == 8 ? -1 : 9 - index);
        return sum != 0 && sum % 11 == 0
            ? Ok("NL", n)
            : Fail("NL", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Poland(object? value)
    {
        var n = Compact(value, "PL");
        if (string.IsNullOrEmpty(n)) return Fail("PL", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return Fail("PL", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}$") || n == "0000000000")
            return Fail("PL", n, ValidationErrorCode.InvalidFormat);
        int[] weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        var expected = 0;
        for (var index = 0; index < 9; index++)
            expected += (n[index] - '0') * weights[index];
        expected %= 11;
        return expected != 10 && n[9] - '0' == expected
            ? Ok("PL", n)
            : Fail("PL", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Denmark(object? value)
    {
        var n = Compact(value, "DK");
        return WeightedCheck("DK", n, 8, [2, 7, 6, 5, 4, 3, 2, 1], 11);
    }

    internal static ValidationResult Estonia(object? value)
    {
        var n = Compact(value, "EE");
        return WeightedCheck("EE", n, 9, [3, 7, 1, 3, 7, 1, 3, 7, 1], 10);
    }

    internal static ValidationResult Finland(object? value)
    {
        var n = Compact(value, "FI");
        if (string.IsNullOrEmpty(n)) return Fail("FI", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return Fail("FI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return Fail("FI", n, ValidationErrorCode.InvalidFormat);
        var remainder = WeightedSum(n[..7], [7, 9, 10, 5, 8, 4, 2]) % 11;
        if (remainder == 1) return Fail("FI", n, ValidationErrorCode.InvalidChecksum);
        var expected = remainder == 0 ? 0 : 11 - remainder;
        return n[7] - '0' == expected
            ? Ok("FI", n)
            : Fail("FI", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Hungary(object? value)
    {
        var n = Compact(value, "HU");
        if (string.IsNullOrEmpty(n)) return Fail("HU", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return Fail("HU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return Fail("HU", n, ValidationErrorCode.InvalidFormat);
        var expected = (10 - WeightedSum(n[..7], [9, 7, 3, 1, 9, 7, 3]) % 10) % 10;
        return n[7] - '0' == expected
            ? Ok("HU", n)
            : Fail("HU", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Luxembourg(object? value)
    {
        var n = Compact(value, "LU");
        if (string.IsNullOrEmpty(n)) return Fail("LU", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return Fail("LU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}$") || n == "00000000")
            return Fail("LU", n, ValidationErrorCode.InvalidFormat);
        return int.Parse(n[6..], CultureInfo.InvariantCulture) ==
               int.Parse(n[..6], CultureInfo.InvariantCulture) % 89
            ? Ok("LU", n)
            : Fail("LU", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Sweden(object? value)
    {
        var n = Compact(value, "SE");
        if (string.IsNullOrEmpty(n)) return Fail("SE", n, ValidationErrorCode.Empty);
        if (n.Length != 12) return Fail("SE", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{10}01$") || Regex.IsMatch(n, @"^0{10}"))
            return Fail("SE", n, ValidationErrorCode.InvalidFormat);
        var sum = 0;
        for (var index = 0; index < 10; index++)
        {
            var product = (n[index] - '0') * (index % 2 == 0 ? 2 : 1);
            sum += product > 9 ? product - 9 : product;
        }
        return sum % 10 == 0
            ? Ok("SE", n)
            : Fail("SE", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Slovenia(object? value)
    {
        var n = Compact(value, "SI");
        if (string.IsNullOrEmpty(n)) return Fail("SI", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return Fail("SI", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{7}$")) return Fail("SI", n, ValidationErrorCode.InvalidFormat);
        var remainder = 11 - WeightedSum(n[..7], [8, 7, 6, 5, 4, 3, 2]) % 11;
        if (remainder == 11) return Fail("SI", n, ValidationErrorCode.InvalidChecksum);
        var expected = remainder == 10 ? 0 : remainder;
        return n[7] - '0' == expected
            ? Ok("SI", n)
            : Fail("SI", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Slovakia(object? value)
    {
        var n = Compact(value, "SK");
        if (string.IsNullOrEmpty(n)) return Fail("SK", n, ValidationErrorCode.Empty);
        if (n.Length != 10) return Fail("SK", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{9}$")) return Fail("SK", n, ValidationErrorCode.InvalidFormat);
        return long.Parse(n, CultureInfo.InvariantCulture) % 11 == 0
            ? Ok("SK", n)
            : Fail("SK", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Cyprus(object? value)
    {
        var n = Compact(value, "CY");
        if (string.IsNullOrEmpty(n)) return Fail("CY", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return Fail("CY", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{8}[A-Z]$") || Regex.IsMatch(n, @"^0{8}"))
            return Fail("CY", n, ValidationErrorCode.InvalidFormat);
        int[] substitutions = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21];
        var sum = 0;
        for (var index = 0; index < 8; index++)
            sum += index % 2 == 0 ? substitutions[n[index] - '0'] : n[index] - '0';
        var expected = (char)('A' + sum % 26);
        return n[8] == expected
            ? Ok("CY", n)
            : Fail("CY", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Spain(object? value)
    {
        var n = Compact(value, "ES");
        if (string.IsNullOrEmpty(n)) return Fail("ES", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return Fail("ES", n, ValidationErrorCode.InvalidLength);

        if (Regex.IsMatch(n, @"^(\d{8}|[XYZ]\d{7})[A-Z]$"))
        {
            var numeric = n[..8].Replace('X', '0').Replace('Y', '1').Replace('Z', '2');
            var expected = "TRWAGMYFPDXBNJZSQVHLCKE"[
                int.Parse(numeric, CultureInfo.InvariantCulture) % 23];
            return n[8] == expected
                ? Ok("ES", n)
                : Fail("ES", n, ValidationErrorCode.InvalidChecksum);
        }

        if (!Regex.IsMatch(n, @"^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$"))
            return Fail("ES", n, ValidationErrorCode.InvalidFormat);
        var sum = 0;
        for (var index = 1; index <= 7; index++)
        {
            var digit = n[index] - '0';
            if (index % 2 == 0)
                sum += digit;
            else
            {
                var doubled = digit * 2;
                sum += doubled / 10 + doubled % 10;
            }
        }
        var controlDigit = (10 - sum % 10) % 10;
        var controlLetter = "JABCDEFGHI"[controlDigit];
        var actual = n[8];
        var valid = Regex.IsMatch(n[..1], @"^[ABEH]$")
            ? actual == (char)('0' + controlDigit)
            : Regex.IsMatch(n[..1], @"^[KPQS]$")
                ? actual == controlLetter
                : actual == (char)('0' + controlDigit) || actual == controlLetter;
        return valid
            ? Ok("ES", n)
            : Fail("ES", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Lithuania(object? value)
    {
        var n = Compact(value, "LT");
        if (string.IsNullOrEmpty(n)) return Fail("LT", n, ValidationErrorCode.Empty);
        if (n.Length is not (9 or 12)) return Fail("LT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || n.All(character => character == '0'))
            return Fail("LT", n, ValidationErrorCode.InvalidFormat);
        int[] firstWeights = n.Length == 9
            ? [1, 2, 3, 4, 5, 6, 7, 8]
            : [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2];
        int[] secondWeights = n.Length == 9
            ? [3, 4, 5, 6, 7, 8, 9, 1]
            : [3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4];
        var baseValue = n[..^1];
        var expected = WeightedSum(baseValue, firstWeights) % 11;
        if (expected == 10) expected = WeightedSum(baseValue, secondWeights) % 11;
        if (expected == 10) expected = 0;
        return n[^1] - '0' == expected
            ? Ok("LT", n)
            : Fail("LT", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Latvia(object? value)
    {
        var n = Compact(value, "LV");
        if (string.IsNullOrEmpty(n)) return Fail("LV", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return Fail("LV", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d{11}$") ||
            int.Parse(n[..2], CultureInfo.InvariantCulture) <= 31)
            return Fail("LV", n, ValidationErrorCode.InvalidFormat);
        var sum = WeightedSum(n[..10], [9, 1, 4, 8, 3, 10, 2, 5, 7, 6]);
        var expected = 3 - sum % 11;
        if (expected < -1) expected += 11;
        if (expected == -1) expected = 0;
        return n[10] - '0' == expected
            ? Ok("LV", n)
            : Fail("LV", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Malta(object? value)
    {
        var n = Compact(value, "MT");
        if (string.IsNullOrEmpty(n)) return Fail("MT", n, ValidationErrorCode.Empty);
        if (n.Length != 8) return Fail("MT", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{7}$")) return Fail("MT", n, ValidationErrorCode.InvalidFormat);
        var expected = 37 - WeightedSum(n[..6], [3, 4, 6, 7, 8, 9]) % 37;
        return int.Parse(n[6..], CultureInfo.InvariantCulture) == expected
            ? Ok("MT", n)
            : Fail("MT", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Romania(object? value)
    {
        var n = Compact(value, "RO");
        if (string.IsNullOrEmpty(n)) return Fail("RO", n, ValidationErrorCode.Empty);
        if (n.Length is < 2 or > 10) return Fail("RO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d+$")) return Fail("RO", n, ValidationErrorCode.InvalidFormat);
        var padded = n.PadLeft(10, '0');
        var expected = WeightedSum(padded[..9], [7, 5, 3, 2, 1, 7, 5, 3, 2]) * 10 % 11;
        if (expected == 10) expected = 0;
        return padded[9] - '0' == expected
            ? Ok("RO", n)
            : Fail("RO", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult CzechRepublic(object? value)
    {
        var n = Compact(value, "CZ");
        if (string.IsNullOrEmpty(n)) return Fail("CZ", n, ValidationErrorCode.Empty);
        if (n.Length is not (8 or 9 or 10)) return Fail("CZ", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$") || n.All(character => character == '0'))
            return Fail("CZ", n, ValidationErrorCode.InvalidFormat);

        if (n.Length == 8)
        {
            var sum = WeightedSum(n[..7], [8, 7, 6, 5, 4, 3, 2]);
            var expected = (11 - sum % 11) % 10;
            return n[7] - '0' == expected
                ? Ok("CZ", n)
                : Fail("CZ", n, ValidationErrorCode.InvalidChecksum);
        }

        return BirthNumberHelper.Validate("CZ", n);
    }

    internal static ValidationResult Australia(object? value)
    {
        var n = Compact(value, "AU");
        if (string.IsNullOrEmpty(n)) return Fail("AU", n, ValidationErrorCode.Empty);
        if (n.Length != 11) return Fail("AU", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{10}$")) return Fail("AU", n, ValidationErrorCode.InvalidFormat);
        int[] weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
        var sum = (n[0] - '1') * weights[0];
        for (var index = 1; index < 11; index++)
            sum += (n[index] - '0') * weights[index];
        return sum % 89 == 0
            ? Ok("AU", n)
            : Fail("AU", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Switzerland(object? value)
    {
        var n = Compact(value, "CHE", "CH");
        foreach (var suffix in new[] { "MWST", "TVA", "IVA" })
            if (n.EndsWith(suffix, StringComparison.Ordinal))
                n = n[..^suffix.Length];
        if (string.IsNullOrEmpty(n)) return Fail("CH", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return Fail("CH", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{8}$")) return Fail("CH", n, ValidationErrorCode.InvalidFormat);
        var expected = 11 - WeightedSum(n[..8], [5, 4, 3, 2, 7, 6, 5, 4]) % 11;
        if (expected == 11) expected = 0;
        if (expected == 10) return Fail("CH", $"CHE{n}", ValidationErrorCode.InvalidChecksum);
        return n[8] - '0' == expected
            ? Ok("CH", $"CHE{n}")
            : Fail("CH", $"CHE{n}", ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult Norway(object? value)
    {
        var n = Compact(value, "NO");
        if (n.EndsWith("MVA", StringComparison.Ordinal)) n = n[..^3];
        if (string.IsNullOrEmpty(n)) return Fail("NO", n, ValidationErrorCode.Empty);
        if (n.Length != 9) return Fail("NO", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^[1-9]\d{8}$")) return Fail("NO", n, ValidationErrorCode.InvalidFormat);
        var expected = 11 - WeightedSum(n[..8], [3, 2, 7, 6, 5, 4, 3, 2]) % 11;
        if (expected == 11) expected = 0;
        if (expected == 10) return Fail("NO", n, ValidationErrorCode.InvalidChecksum);
        return n[8] - '0' == expected
            ? Ok("NO", n)
            : Fail("NO", n, ValidationErrorCode.InvalidChecksum);
    }

    internal static ValidationResult UnitedKingdom(object? value)
    {
        var n = Compact(value, "GB");
        if (string.IsNullOrEmpty(n)) return Fail("GB", n, ValidationErrorCode.Empty);
        if (Regex.IsMatch(n, @"^GD\d{3}$"))
            return int.Parse(n[2..], CultureInfo.InvariantCulture) <= 499
                ? ValidationResult.Ok("GB", n, ValidationLevel.Format)
                : Fail("GB", n, ValidationErrorCode.InvalidFormat);
        if (Regex.IsMatch(n, @"^HA\d{3}$"))
            return int.Parse(n[2..], CultureInfo.InvariantCulture) >= 500
                ? ValidationResult.Ok("GB", n, ValidationLevel.Format)
                : Fail("GB", n, ValidationErrorCode.InvalidFormat);
        if (n.Length is not (9 or 12)) return Fail("GB", n, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(n, @"^\d+$")) return Fail("GB", n, ValidationErrorCode.InvalidFormat);
        var baseValue = n[..9];
        var sum = WeightedSum(baseValue[..7], [8, 7, 6, 5, 4, 3, 2])
            + int.Parse(baseValue[7..], CultureInfo.InvariantCulture);
        return sum % 97 == 0 || (sum + 55) % 97 == 0
            ? Ok("GB", n)
            : Fail("GB", n, ValidationErrorCode.InvalidChecksum);
    }

    private static ValidationResult WeightedCheck(
        string country,
        string value,
        int length,
        int[] weights,
        int modulus)
    {
        if (string.IsNullOrEmpty(value)) return Fail(country, value, ValidationErrorCode.Empty);
        if (value.Length != length) return Fail(country, value, ValidationErrorCode.InvalidLength);
        if (!Regex.IsMatch(value, @"^\d+$") || value.All(character => character == '0'))
            return Fail(country, value, ValidationErrorCode.InvalidFormat);
        return WeightedSum(value, weights) % modulus == 0
            ? Ok(country, value)
            : Fail(country, value, ValidationErrorCode.InvalidChecksum);
    }

    private static int WeightedSum(string value, int[] weights)
    {
        var sum = 0;
        for (var index = 0; index < value.Length; index++)
            sum += (value[index] - '0') * weights[index];
        return sum;
    }

    private static string Compact(object? value, params string[] prefixes)
    {
        if (value is not (string or sbyte or byte or short or ushort or int or uint or long or ulong))
            return string.Empty;
        var normalized = Regex.Replace(
            Convert.ToString(value, CultureInfo.InvariantCulture)!.Trim().ToUpperInvariant(),
            @"[\s./-]+",
            string.Empty);
        var prefix = prefixes.FirstOrDefault(
            candidate => normalized.StartsWith(candidate, StringComparison.Ordinal));
        return prefix is null ? normalized : normalized[prefix.Length..];
    }

    private static object? WithoutPrefix(object? value, params string[] prefixes)
    {
        if (value is not string text) return value;
        var normalized = text.Trim().ToUpperInvariant();
        var prefix = prefixes.FirstOrDefault(
            candidate => normalized.StartsWith(candidate, StringComparison.Ordinal));
        return prefix is null ? value : normalized[prefix.Length..];
    }

    private static ValidationResult Ok(string country, string value) =>
        ValidationResult.Ok(country, value, ValidationLevel.Checksum);

    private static ValidationResult Fail(
        string country,
        string value,
        ValidationErrorCode error) =>
        ValidationResult.Fail(country, value, error);
}
