// Copyright 2019-2020 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ThemeProps } from '../types';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import useIsMounted from '../hooks/useIsMounted';
import { Result, Validator } from '../util/validators';

interface BasicProps {
  isError?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

type Props<T extends BasicProps> = T & {
  className?: string;
  validator: Validator<string>;
  component: React.ComponentType<T>;
  onValidatedChange: (value: string | null) => void;
  defaultValue?: string;
}

function ValidatedInput<T extends Record<string, unknown>> ({ className, component: Input, defaultValue, onValidatedChange, validator, ...props }: Props<T>): React.ReactElement<Props<T>> {
  const [value, setValue] = useState(defaultValue || '');
  const [validationResult, setValidationResult] = useState<Result<string>>(Result.ok(''));
  const isMounted = useIsMounted();

  useEffect(() => {
    // Do not show any error on first mount
    if (!isMounted) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async (): Promise<void> => {
      const result = await validator(value);

      setValidationResult(result);
      onValidatedChange(Result.isOk(result) ? value : null);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, validator, onValidatedChange]);

  return (
    <div className={className}>
      <Input
        {...props as unknown as T}
        isError={Result.isError(validationResult)}
        onChange={setValue}
        value={value}
      />
      {Result.isError(validationResult) && <span className='error'>{validationResult.error.errorDescription}</span>}
    </div>
  );
}

export default styled(ValidatedInput)(({ theme }: ThemeProps) => `
  .error {
    display: block;
    margin-top: -10px;
    font-size: ${theme.labelFontSize};
    line-height: ${theme.labelLineHeight};
    color: ${theme.errorColor};
  }
`);
