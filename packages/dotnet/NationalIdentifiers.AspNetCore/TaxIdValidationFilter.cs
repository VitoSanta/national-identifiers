using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace NationalIdentifiers.AspNetCore;

/// <summary>Runs DataAnnotations validation for action arguments before controller execution.</summary>
public sealed class TaxIdValidationFilter : IAsyncActionFilter
{
    /// <inheritdoc />
    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(next);

        foreach (var (argumentName, argument) in context.ActionArguments)
        {
            if (argument is null)
                continue;

            var results = new List<ValidationResult>();
            var validationContext = new ValidationContext(
                argument,
                context.HttpContext.RequestServices,
                items: null);

            if (Validator.TryValidateObject(argument, validationContext, results, validateAllProperties: true))
                continue;

            foreach (var result in results)
            {
                var members = result.MemberNames.Any()
                    ? result.MemberNames
                    : new[] { string.Empty };

                foreach (var member in members)
                {
                    var key = string.IsNullOrEmpty(member)
                        ? argumentName
                        : $"{argumentName}.{member}";
                    context.ModelState.TryAddModelError(key, result.ErrorMessage ?? "Validation failed.");
                }
            }
        }

        if (!context.ModelState.IsValid)
        {
            context.Result = new BadRequestObjectResult(
                new ValidationProblemDetails(context.ModelState));
            return;
        }

        await next();
    }
}
