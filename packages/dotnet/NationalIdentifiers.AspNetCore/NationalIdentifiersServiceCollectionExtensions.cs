using Microsoft.Extensions.DependencyInjection;
using NationalIdentifiers.Core;

namespace NationalIdentifiers.AspNetCore;

/// <summary>Dependency-injection registration for NationalIdentifiers.</summary>
public static class NationalIdentifiersServiceCollectionExtensions
{
    /// <summary>Registers the stateless tax ID validator and ASP.NET Core filter.</summary>
    public static IServiceCollection AddNationalIdentifiers(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddSingleton<ITaxIdValidator, TaxIdValidator>();
        services.AddScoped<TaxIdValidationFilter>();
        return services;
    }
}
