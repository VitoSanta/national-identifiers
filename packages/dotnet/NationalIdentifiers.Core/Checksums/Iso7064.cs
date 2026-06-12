namespace NationalIdentifiers.Core.Checksums;

internal static class Iso7064
{
    /// <summary>ISO 7064 MOD 11-2 over a digit string (used by China, etc.).</summary>
    internal static bool ValidateMod11_2(string digits)
    {
        int sum = 0;
        for (int i = 0; i < digits.Length - 1; i++)
        {
            sum += (digits[i] - '0') * (int)Math.Pow(2, digits.Length - 1 - i);
        }
        int remainder = sum % 11;
        int expected = (12 - remainder) % 11;
        char checkChar = expected == 10 ? 'X' : (char)('0' + expected);
        return digits[^1] == checkChar;
    }

    /// <summary>ISO 7064 MOD 97-10 check over a numeric string (returns true when remainder == 1).</summary>
    internal static bool ValidateMod97_10(string digits)
    {
        int remainder = 0;
        foreach (char c in digits)
        {
            remainder = (remainder * 10 + (c - '0')) % 97;
        }
        return remainder == 1;
    }
}
