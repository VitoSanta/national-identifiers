namespace NationalIdentifiers.Core.Countries;

internal static class DateValidator
{
    internal static bool IsValidDate(int year, int month, int day)
    {
        if (month < 1 || month > 12 || day < 1) return false;
        try
        {
            var d = new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
            return d.Year == year && d.Month == month && d.Day == day;
        }
        catch { return false; }
    }
}
