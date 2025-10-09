"use client";

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type MutableRefObject,
  type ReactElement,
  type ReactNode,
  type SpanHTMLAttributes,
  type MouseEventHandler
} from "react";

import { cn } from "@/lib/utils";

type DropdownMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: MutableRefObject<HTMLElement | null>;
  menuRef: MutableRefObject<HTMLDivElement | null>;
  menuId: string;
  labelId?: string;
  setLabelId: (id?: string) => void;
};

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenuContext(component: string): DropdownMenuContextValue {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(`${component} must be used within a <DropdownMenu>`);
  }
  return context;
}

type DropdownMenuProps = {
  children: ReactNode;
  className?: string;
};

function DropdownMenu({ children, className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [labelId, setLabelId] = useState<string | undefined>();
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const value = useMemo<DropdownMenuContextValue>(
    () => ({ open, setOpen, triggerRef, menuRef, menuId, labelId, setLabelId }),
    [labelId, menuId, open]
  );

  return (
    <DropdownMenuContext.Provider value={value}>
      <div className={cn("relative inline-flex", className)}>{children}</div>
    </DropdownMenuContext.Provider>
  );
}

type DropdownMenuTriggerProps = {
  asChild?: boolean;
  children: ReactElement;
} & HTMLAttributes<HTMLElement>;

const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  ({ asChild, children, onClick, onKeyDown, ...props }, forwardedRef) => {
    const { open, setOpen, triggerRef, menuId } = useDropdownMenuContext("DropdownMenuTrigger");

    const assignRef = (node: HTMLElement | null) => {
      triggerRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    const handleClick: MouseEventHandler<HTMLElement> = (event) => {
      onClick?.(event);
      setOpen((previous) => !previous);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key === " " || event.key === "Enter" || event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
      }
    };

    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error("DropdownMenuTrigger with `asChild` expects a single React element child.");
      }
      return cloneElement(children, {
        ...props,
        "aria-controls": menuId,
        "aria-expanded": open,
        "aria-haspopup": "menu",
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        ref: assignRef
      });
    }

    return (
      <button
        type="button"
        ref={assignRef}
        aria-controls={menuId}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

type DropdownMenuContentProps = {
  sideOffset?: number;
  align?: "start" | "center" | "end";
  children: ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 4, align = "center", children, style, ...props }, forwardedRef) => {
    const { open, setOpen, triggerRef, menuRef, menuId, labelId } = useDropdownMenuContext("DropdownMenuContent");

    useEffect(() => {
      if (!open) return;
      const handlePointerDown = (event: MouseEvent | TouchEvent) => {
        const target = event.target as Node;
        if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) {
          return;
        }
        setOpen(false);
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("touchstart", handlePointerDown);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handlePointerDown);
        document.removeEventListener("touchstart", handlePointerDown);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, setOpen, triggerRef, menuRef]);

    useEffect(() => {
      if (open && menuRef.current) {
        menuRef.current.focus();
      }
    }, [open, menuRef]);

    const assignRef = (node: HTMLDivElement | null) => {
      menuRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        (forwardedRef as MutableRefObject<HTMLDivElement | null>).current = node;
      }
    };

    if (!open) return null;

    const alignmentClass =
      align === "start" ? "left-0" : align === "end" ? "right-0" : "left-1/2 -translate-x-1/2";

    return (
      <div
        ref={assignRef}
        id={menuId}
        role="menu"
        tabIndex={-1}
        aria-labelledby={labelId}
        className={cn(
          "absolute z-50 mt-2 min-w-[10rem] rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg focus:outline-none",
          alignmentClass,
          className
        )}
        style={{ marginTop: sideOffset, ...style }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />
  )
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

const DropdownMenuLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, children, ...props }, ref) => {
    const { setLabelId } = useDropdownMenuContext("DropdownMenuLabel");
    const id = useId();

    useEffect(() => {
      setLabelId(id);
      return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (
      <div
        ref={ref}
        id={id}
        role="presentation"
        className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", inset && "pl-8", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

type DropdownMenuGroupProps = {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>;

const DropdownMenuGroup = forwardRef<HTMLDivElement, DropdownMenuGroupProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} role="group" className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  )
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

type DropdownMenuRadioGroupContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const DropdownMenuRadioGroupContext = createContext<DropdownMenuRadioGroupContextValue | null>(null);

type DropdownMenuRadioGroupProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>;

const DropdownMenuRadioGroup = ({ value, onValueChange, children, className, ...props }: DropdownMenuRadioGroupProps) => {
  const contextValue = useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({ value, onValueChange }),
    [onValueChange, value]
  );

  return (
    <DropdownMenuRadioGroupContext.Provider value={contextValue}>
      <div role="radiogroup" className={cn("flex flex-col", className)} {...props}>
        {children}
      </div>
    </DropdownMenuRadioGroupContext.Provider>
  );
};

function useDropdownMenuRadioGroupContext(component: string) {
  const context = useContext(DropdownMenuRadioGroupContext);
  if (!context) {
    throw new Error(`${component} must be used within a <DropdownMenuRadioGroup>`);
  }
  return context;
}

type DropdownMenuRadioItemProps = {
  value: string;
  inset?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownMenuRadioItem = forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
  ({ value, className, inset, children, disabled, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext("DropdownMenuRadioItem");
    const { value: selected, onValueChange } = useDropdownMenuRadioGroupContext("DropdownMenuRadioItem");
    const isSelected = selected === value;

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      onValueChange?.(value);
      setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitemradio"
        aria-checked={isSelected}
        data-state={isSelected ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center" aria-hidden>
          <span
            className={cn("h-2 w-2 rounded-full", isSelected ? "bg-current" : "border border-muted-foreground/60")}
          />
        </span>
        {children}
      </button>
    );
  }
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

type DropdownMenuCheckboxItemProps = {
  checked?: boolean;
  inset?: boolean;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownMenuCheckboxItem = forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
  ({ checked, className, inset, children, disabled, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext("DropdownMenuCheckboxItem");

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitemcheckbox"
        aria-checked={checked ?? false}
        data-state={checked ? "checked" : "unchecked"}
        disabled={disabled}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-md py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <span className="absolute left-2 flex h-4 w-4 items-center justify-center" aria-hidden>
          <span
            className={cn(
              "inline-flex h-4 w-4 items-center justify-center rounded border border-muted-foreground/60 bg-background",
              checked && "border-none bg-current text-background"
            )}
          >
            {checked ? <span className="h-2 w-2 rounded-sm bg-background" /> : null}
          </span>
        </span>
        {children}
      </button>
    );
  }
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

type DropdownMenuItemProps = {
  inset?: boolean;
  children: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const DropdownMenuItem = forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, inset, children, disabled, onClick, ...props }, ref) => {
    const { setOpen } = useDropdownMenuContext("DropdownMenuItem");

    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      onClick?.(event);
      if (event.defaultPrevented || disabled) return;
      setOpen(false);
    };

    return (
      <button
        ref={ref}
        type="button"
        role="menuitem"
        disabled={disabled}
        className={cn(
          "flex cursor-default select-none items-center rounded-md px-3 py-1.5 text-sm outline-none transition-colors focus:bg-muted focus:text-foreground disabled:cursor-not-allowed disabled:opacity-50",
          inset && "pl-8",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuShortcut = ({ className, ...props }: SpanHTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-tight text-muted-foreground", className)} {...props} />;
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";

const DropdownMenuSub = ({ children }: { children: ReactNode }) => children;
const DropdownMenuPortal = ({ children }: { children: ReactNode }) => <>{children}</>;
const DropdownMenuSubTrigger = DropdownMenuItem;
const DropdownMenuSubContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>((props, ref) => (
  <div ref={ref} {...props} />
));
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup
};
