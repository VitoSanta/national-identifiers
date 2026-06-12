namespace NationalIdentifiers.Core.Checksums;

internal static class Luhn
{
    /// <summary>Standard Luhn check over a digit string.</summary>
    internal static bool Validate(string digits)
    {
        int sum = 0;
        bool doubleIt = false;
        for (int i = digits.Length - 1; i >= 0; i--)
        {
            int d = digits[i] - '0';
            if (doubleIt)
            {
                d *= 2;
                if (d > 9) d -= 9;
            }
            sum += d;
            doubleIt = !doubleIt;
        }
        return sum % 10 == 0;
    }
}
