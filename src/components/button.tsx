import {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  createElement,
  PropsWithChildren,
  ReactNode,
} from "react";

import styles from "./button.module.scss";

type ButtonProps = PropsWithChildren<
  {
    tag?: "a" | "button";
    class?: string;
    variant?: "primary" | "secondary";
  } & ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement>
>;

function ButtonWrapper({
  tag = "a",
  class: className,
  children,
  variant = "primary",
  ...props
}: ButtonProps) {
  const Wrapper = (props: any) => createElement(tag, props, props.children);

  return (
    <Wrapper
      {...props}
      class={[styles.buttonBase, className, variant]
        .filter((c) => !!c)
        .join(" ")}
    >
      {children}
    </Wrapper>
  );
}

export function Button({ class: className = "", ...props }: ButtonProps) {
  return (
    <ButtonWrapper {...props} class={`${styles.nonIconButton} ${className}`} />
  );
}

interface IconAndTextButtonProps extends ButtonProps {
  leftIcon?: ReactNode;
}

export function IconAndTextButton({
  class: className = "",
  leftIcon,
  children,
  ...props
}: IconAndTextButtonProps) {
  return (
    <ButtonWrapper {...props} class={`${styles.iconButton} ${className}`}>
      <span className={styles.iconButtonButton}>{leftIcon}</span>
      {children}
    </ButtonWrapper>
  );
}

interface IconOnlyButtonProps extends ButtonProps {
}

export function IconOnlyButton({
  class: className = "",
  children,
  ...props
}: IconOnlyButtonProps) {
  return (
    <ButtonWrapper {...props} class={`${styles.iconOnlyButton} ${className}`}>
      <span>{children}</span>
    </ButtonWrapper>
  );
}
