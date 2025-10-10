import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { StartCaseDialog } from "@/components/dashboard/start-case-dialog";
import type { CreateCaseFormInput } from "@/lib/hooks/useCreateCase";

vi.mock("@/components/ui/select", () => {
  const React = require("react");
  const SelectContext = React.createContext<{
    value: string | undefined;
    onValueChange: ((value: string) => void) | undefined;
    options: Array<{ value: string; label: string }>;
    setOptions: React.Dispatch<
      React.SetStateAction<Array<{ value: string; label: string }>>
    >;
  } | null>(null);

  const Select = ({ value, onValueChange, children }: any) => {
    const [options, setOptions] = React.useState<
      Array<{ value: string; label: string }>
    >([]);
    const contextValue = React.useMemo(
      () => ({ value, onValueChange, options, setOptions }),
      [value, onValueChange, options],
    );
    return (
      <SelectContext.Provider value={contextValue}>
        {children}
      </SelectContext.Provider>
    );
  };

  const SelectTrigger = React.forwardRef<
    HTMLSelectElement,
    React.SelectHTMLAttributes<HTMLSelectElement>
  >((props, ref) => {
    const ctx = React.useContext(SelectContext);
    return (
      <select
        {...props}
        ref={ref}
        value={ctx?.value ?? ""}
        onChange={(event) => ctx?.onValueChange?.(event.target.value)}
      >
        <option value="" disabled>
          Select an option
        </option>
        {ctx?.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  });
  SelectTrigger.displayName = "MockSelectTrigger";

  const SelectValue = () => null;

  const SelectContent = ({ children }: any) => {
    const ctx = React.useContext(SelectContext);
    const options = React.Children.toArray(children)
      .map((child: any) => {
        if (child?.props?.value) {
          return { value: child.props.value, label: child.props.children };
        }
        return null;
      })
      .filter(Boolean) as Array<{ value: string; label: string }>;
    React.useEffect(() => {
      ctx?.setOptions(options);
    }, [ctx, options]);
    return null;
  };

  const SelectItem = ({ value, children }: any) => (
    <option data-value={value}>{children}</option>
  );

  return {
    Select,
    SelectGroup: ({ children }: any) => <>{children}</>,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectSeparator: () => null,
    SelectScrollUpButton: () => null,
    SelectScrollDownButton: () => null,
    SelectLabel: ({ children }: any) => <optgroup label={children} />,
  };
});

const mutateAsync = vi.fn<
  Promise<unknown>,
  [CreateCaseFormInput]
>();
const reset = vi.fn();

vi.mock("@/lib/hooks/useCreateCase", () => ({
  useCreateCase: vi.fn(() => ({
    mutateAsync,
    isPending: false,
    reset,
  })),
}));

async function selectOption(label: string, optionValue: string) {
  const select = screen.getByLabelText(label);
  await userEvent.selectOptions(select, optionValue);
}

describe("StartCaseDialog", () => {
  beforeEach(() => {
    mutateAsync.mockReset();
    reset.mockReset();
  });

  function renderDialog(overrides: Partial<Parameters<typeof StartCaseDialog>[0]> = {}) {
    const onOpenChange = vi.fn();
    const onSuccess = vi.fn();
    render(
      <StartCaseDialog
        open
        userId="user-1"
        onOpenChange={onOpenChange}
        onSuccess={onSuccess}
        {...overrides}
      />,
    );
    return { onOpenChange, onSuccess };
  }

  it("validates required fields", async () => {
    renderDialog();

    await userEvent.click(screen.getByRole("button", { name: "Save case" }));

    expect(
      await screen.findByText(/enter a short name/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/select the main case type/i)).toBeVisible();
    expect(screen.getByText(/select where this case is filed/i)).toBeVisible();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("submits form values to the mutation and resets input", async () => {
    mutateAsync.mockResolvedValueOnce({});
    const { onOpenChange, onSuccess } = renderDialog();

    await userEvent.type(screen.getByLabelText(/case nickname/i), "Tenant help");
    await selectOption("Case type", "eviction");
    await selectOption("Jurisdiction", "marion_in");
    await userEvent.type(screen.getByLabelText(/notes/i), "Urgent court date");

    await userEvent.click(screen.getByRole("button", { name: "Save case" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        title: "Tenant help",
        caseType: "eviction",
        jurisdiction: "marion_in",
        notes: "Urgent court date",
      });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Form fields reset
    expect(screen.getByLabelText(/case nickname/i)).toHaveValue("");
    expect(reset).toHaveBeenCalled();
  });

  it("shows an error alert if the mutation rejects", async () => {
    mutateAsync.mockRejectedValueOnce(new Error("Failed to create"));
    renderDialog();

    await userEvent.type(screen.getByLabelText(/case nickname/i), "Tenant help");
    await selectOption("Case type", "eviction");
    await selectOption("Jurisdiction", "marion_in");

    await userEvent.click(screen.getByRole("button", { name: "Save case" }));

    expect(await screen.findByText(/we couldn’t save your case/i)).toBeVisible();
    expect(screen.getByText(/failed to create/i)).toBeVisible();
  });
});
