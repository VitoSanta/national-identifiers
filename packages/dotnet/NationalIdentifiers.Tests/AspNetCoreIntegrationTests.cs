using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using NationalIdentifiers.AspNetCore;
using NationalIdentifiers.Core;
using DataAnnotationsValidationResult = System.ComponentModel.DataAnnotations.ValidationResult;

namespace NationalIdentifiers.Tests;

public class AspNetCoreIntegrationTests
{
    [Fact]
    public void AddNationalIdentifiers_RegistersSingletonValidator()
    {
        using var services = new ServiceCollection()
            .AddNationalIdentifiers()
            .BuildServiceProvider();

        Assert.Same(
            services.GetRequiredService<ITaxIdValidator>(),
            services.GetRequiredService<ITaxIdValidator>());
        Assert.NotNull(services.GetRequiredService<TaxIdValidationFilter>());
    }

    [Theory]
    [InlineData("RSSMRA85T10A562S", true)]
    [InlineData("RSSMRA85T10A562A", false)]
    public void ValidTaxId_UsesSiblingCountryProperty(string taxId, bool expected)
    {
        using var services = new ServiceCollection()
            .AddNationalIdentifiers()
            .BuildServiceProvider();
        var model = new TaxIdRequest { Country = "IT", TaxId = taxId };
        var results = Validate(model, services);

        Assert.Equal(expected, results.Count == 0);
    }

    [Fact]
    public void ValidTaxId_ReportsMissingCountryProperty()
    {
        var model = new MissingCountryRequest { TaxId = "RSSMRA85T10A562S" };
        var results = Validate(model);

        Assert.Contains(results, result =>
            result.ErrorMessage == "Country property 'Country' was not found.");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void ValidTaxId_AllowsEmptyValues(string? taxId)
    {
        var model = new TaxIdRequest { Country = "IT", TaxId = taxId };
        var results = Validate(model);

        Assert.Empty(results);
    }

    [Fact]
    public void Required_ControlsWhetherTaxIdIsMandatory()
    {
        var model = new RequiredTaxIdRequest { Country = "IT", TaxId = string.Empty };
        var results = Validate(model);

        var result = Assert.Single(results);
        Assert.Contains(nameof(RequiredTaxIdRequest.TaxId), result.MemberNames);
        Assert.Contains("required", result.ErrorMessage!, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void ValidTaxId_PolicyMode_AllowsAdvisoryFailures()
    {
        var model = new AdvisoryTaxIdRequest { Country = "SO", TaxId = "12" };

        Assert.Empty(Validate(model));
    }

    [Fact]
    public void ValidTaxId_StrictMode_RejectsAdvisoryFailures()
    {
        var model = new StrictTaxIdRequest { Country = "SO", TaxId = "12" };

        Assert.Single(Validate(model));
    }

    [Fact]
    public async Task Filter_ReturnsBadRequest_ForInvalidTaxId()
    {
        using var services = new ServiceCollection()
            .AddNationalIdentifiers()
            .BuildServiceProvider();
        var httpContext = new DefaultHttpContext { RequestServices = services };
        var actionContext = new ActionContext(
            httpContext,
            new RouteData(),
            new ActionDescriptor());
        var executingContext = new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>
            {
                ["request"] = new TaxIdRequest
                {
                    Country = "IT",
                    TaxId = "RSSMRA85T10A562A",
                },
            },
            controller: new object());
        var filter = services.GetRequiredService<TaxIdValidationFilter>();
        var nextCalled = false;

        await filter.OnActionExecutionAsync(
            executingContext,
            () =>
            {
                nextCalled = true;
                return Task.FromResult(new ActionExecutedContext(
                    actionContext,
                    new List<IFilterMetadata>(),
                    controller: new object()));
            });

        Assert.False(nextCalled);
        Assert.IsType<BadRequestObjectResult>(executingContext.Result);
        Assert.Contains("request.TaxId", executingContext.ModelState.Keys);
    }

    [Fact]
    public async Task Filter_Continues_ForEmptyOptionalTaxId()
    {
        using var services = new ServiceCollection()
            .AddNationalIdentifiers()
            .BuildServiceProvider();
        var httpContext = new DefaultHttpContext { RequestServices = services };
        var actionContext = new ActionContext(
            httpContext,
            new RouteData(),
            new ActionDescriptor());
        var executingContext = new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>
            {
                ["request"] = new TaxIdRequest
                {
                    Country = "IT",
                    TaxId = string.Empty,
                },
            },
            controller: new object());
        var filter = services.GetRequiredService<TaxIdValidationFilter>();
        var nextCalled = false;

        await filter.OnActionExecutionAsync(
            executingContext,
            () =>
            {
                nextCalled = true;
                return Task.FromResult(new ActionExecutedContext(
                    actionContext,
                    new List<IFilterMetadata>(),
                    controller: new object()));
            });

        Assert.True(nextCalled);
        Assert.Null(executingContext.Result);
        Assert.True(executingContext.ModelState.IsValid);
    }

    private static List<DataAnnotationsValidationResult> Validate(
        object model,
        IServiceProvider? services = null)
    {
        var results = new List<DataAnnotationsValidationResult>();
        Validator.TryValidateObject(
            model,
            new ValidationContext(model, services, items: null),
            results,
            validateAllProperties: true);
        return results;
    }

    private sealed class TaxIdRequest
    {
        public string Country { get; init; } = string.Empty;

        [ValidTaxId(nameof(Country))]
        public string? TaxId { get; init; }
    }

    private sealed class RequiredTaxIdRequest
    {
        public string Country { get; init; } = string.Empty;

        [Required]
        [ValidTaxId(nameof(Country))]
        public string? TaxId { get; init; }
    }

    private sealed class MissingCountryRequest
    {
        [ValidTaxId("Country")]
        public string TaxId { get; init; } = string.Empty;
    }

    private sealed class AdvisoryTaxIdRequest
    {
        public string Country { get; init; } = string.Empty;

        [ValidTaxId(nameof(Country))]
        public string? TaxId { get; init; }
    }

    private sealed class StrictTaxIdRequest
    {
        public string Country { get; init; } = string.Empty;

        [ValidTaxId(nameof(Country), Mode = TaxIdValidationMode.Strict)]
        public string? TaxId { get; init; }
    }
}
