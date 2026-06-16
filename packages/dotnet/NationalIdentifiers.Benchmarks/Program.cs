using System.Diagnostics;
using System.Globalization;
using NationalIdentifiers.Core;

var validator = new TaxIdValidator();
var identity = new TaxIdIdentity("Mario", "Rossi", new DateOnly(1985, 12, 10), 'M', "A562");

var benchmarks = new[]
{
    Measure("tax_id_person checksum (IT)", () => validator.Validate("IT", "RSSMRA85T10A562S")),
    Measure("tax_id_person format (US)", () => validator.Validate("US", "123-45-6789")),
    Measure("vat checksum (IT)", () => validator.Validate("IT", IdentifierType.Vat, "00743110157")),
    Measure("company format (US)", () => validator.Validate("US", IdentifierType.TaxIdCompany, "12-3456789")),
    Measure("identity consistency (IT)", () =>
        TaxIdIdentityValidator.Validate("IT", "RSSMRA85T10A562S", identity)),
};

Console.WriteLine("# National Identifiers .NET measurements");
Console.WriteLine();
Console.WriteLine($".NET: {Environment.Version}");
Console.WriteLine();
Console.WriteLine("| Case | Median per call |");
Console.WriteLine("|---|---:|");

foreach (var benchmark in benchmarks)
{
    var microseconds = (benchmark.MedianNanoseconds / 1_000.0)
        .ToString("F2", CultureInfo.InvariantCulture);
    Console.WriteLine($"| {benchmark.Label} | {microseconds} us |");
}

static BenchmarkResult Measure(string label, Action action)
{
    for (var index = 0; index < 10_000; index++)
        action();

    const int batches = 25;
    const int iterations = 100_000;
    var samples = new double[batches];

    for (var batch = 0; batch < batches; batch++)
    {
        var stopwatch = Stopwatch.StartNew();
        for (var index = 0; index < iterations; index++)
            action();
        stopwatch.Stop();

        samples[batch] = stopwatch.Elapsed.TotalNanoseconds / iterations;
    }

    Array.Sort(samples);
    var median = batches % 2 == 0
        ? (samples[batches / 2 - 1] + samples[batches / 2]) / 2
        : samples[batches / 2];

    return new BenchmarkResult(label, median);
}

internal sealed record BenchmarkResult(string Label, double MedianNanoseconds);
