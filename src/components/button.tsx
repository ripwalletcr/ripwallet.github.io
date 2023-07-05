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
    className?: string;
    variant?: "primary" | "secondary";
  } & ButtonHTMLAttributes<HTMLButtonElement> &
    AnchorHTMLAttributes<HTMLAnchorElement>
>;

function ButtonWrapper({
  tag = "a",
  className,
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

export function Button({ className, ...props }: ButtonProps) {
  return (
    <ButtonWrapper
      {...props}
      className={`${styles.nonIconButton} ${className}`}
    />
  );
}

interface IconAndTextButtonProps extends ButtonProps {
  leftIcon?: ReactNode;
}

export function IconAndTextButton({
  className,
  leftIcon,
  children,
  ...props
}: IconAndTextButtonProps) {
  return (
    <ButtonWrapper {...props} className={`${styles.iconButton} ${className}`}>
      <span className={styles.iconButtonButton}>{leftIcon}</span>
      {children}
    </ButtonWrapper>
  );
}

interface IconOnlyButtonProps extends ButtonProps {}

export function IconOnlyButton({
  className,
  children,
  ...props
}: IconOnlyButtonProps) {
  return (
    <ButtonWrapper
      {...props}
      className={`${styles.iconOnlyButton} ${className}`}
    >
      <span>{children}</span>
    </ButtonWrapper>
  );
}
