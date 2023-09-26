import React from 'react';
import { getAnswerOptionLabel } from '../../../utils/openChoice';
import { StandardTextField } from '../Textfield.styles';
import Autocomplete from '@mui/material/Autocomplete';
import type { QuestionnaireItem, QuestionnaireItemAnswerOption } from 'fhir/r4';
import type { PropsWithIsTabledAttribute } from '../../../interfaces/renderProps.interface';
import { PropsWithParentIsReadOnlyAttribute } from '../../../interfaces/renderProps.interface';
import useRenderingExtensions from '../../../hooks/useRenderingExtensions';
import useReadOnly from '../../../hooks/useReadOnly';

interface OpenChoiceSelectAnswerOptionFieldProps
  extends PropsWithIsTabledAttribute,
    PropsWithParentIsReadOnlyAttribute {
  qItem: QuestionnaireItem;
  options: QuestionnaireItemAnswerOption[];
  valueSelect: QuestionnaireItemAnswerOption | null;
  onChange: (newValue: QuestionnaireItemAnswerOption | string | null) => void;
}

function OpenChoiceSelectAnswerOptionField(props: OpenChoiceSelectAnswerOptionFieldProps) {
  const { qItem, options, valueSelect, isTabled, parentIsReadOnly, onChange } = props;

  const readOnly = useReadOnly(qItem, parentIsReadOnly);
  const { displayUnit, displayPrompt, entryFormat } = useRenderingExtensions(qItem);

  return (
    <Autocomplete
      id={qItem.id}
      value={valueSelect ?? null}
      options={options}
      getOptionLabel={(option) => getAnswerOptionLabel(option)}
      onChange={(_, newValue) => onChange(newValue)}
      freeSolo
      autoHighlight
      sx={{ maxWidth: !isTabled ? 280 : 3000, minWidth: 160, flexGrow: 1 }}
      disabled={readOnly}
      size="small"
      placeholder={entryFormat}
      renderInput={(params) => (
        <StandardTextField
          isTabled={isTabled}
          label={displayPrompt}
          {...params}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {params.InputProps.endAdornment}
                {displayUnit}
              </>
            )
          }}
        />
      )}
    />
  );
}

export default OpenChoiceSelectAnswerOptionField;
