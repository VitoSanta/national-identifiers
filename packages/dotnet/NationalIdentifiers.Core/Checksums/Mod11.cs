namespace NationalIdentifiers.Core.Checksums;

internal static class Mod11
{
    /// <summary>
    /// Generic modulo-11 weighted sum using the supplied <paramref name="weights"/>.
    /// Returns true when (sum % 11) == <paramref name="expectedRemainder"/>.
    /// </summary>
    internal static bool Validate(
        string digits,
        int[] weights,
        int expectedRemainder = 0)
    {
        int sum = 0;
        for (int i = 0; i < digits.Length; i++)
            sum += (digits[i] - '0') * weights[i];
        return sum % 11 == expectedRemainder;
    }

    /// <summary>
    /// Computes a single check digit via modulo 11 using ascending weights 2..n applied
    /// right-to-left over <paramref name="digits"/> (all digits except the last).
    /// The check digit is (11 - (sum % 11)) % 11; returns -1 if the result would be 10.
    /// </summary>
    internal static int ComputeCheckDigit(string digits, int startWeight = 2)
    {
        int sum = 0;
        int weight = startWeight;
        for (int i = digits.Length - 1; i >= 0; i--)
        {
            sum += (digits[i] - '0') * weight++;
        }
        int r = sum % 11;
        return r == 0 ? 0 : r == 1 ? -1 : 11 - r;
    }
}
