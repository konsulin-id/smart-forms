import React from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';

interface Props {
  value: string;
  label: string;
  isChecked: boolean;
  onCheckedChange: (value: string) => unknown;
}

function QItemCheckboxSingle(props: Props) {
  const { value, label, isChecked, onCheckedChange } = props;

  return (
    <FormControlLabel
      control={
        <Checkbox size="small" checked={isChecked} onChange={() => onCheckedChange(value)} />
      }
      label={label}
      sx={{ mr: 3 }}
    />
  );
}

export default QItemCheckboxSingle;
