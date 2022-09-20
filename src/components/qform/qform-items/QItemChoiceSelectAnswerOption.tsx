import React from 'react';
import {
  Container,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography
} from '@mui/material';
import { PropsWithQrItemChangeHandler, PropsWithRepeatsAttribute } from '../FormModel';
import { QuestionnaireResponseService } from '../../questionnaireResponse/QuestionnaireResponseService';
import { QuestionnaireItem, QuestionnaireResponseItem } from 'fhir/r5';
import { findInAnswerOptions, getQrChoiceValue } from './QItemChoiceFunctions';

interface Props
  extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem>,
    PropsWithRepeatsAttribute {
  qItem: QuestionnaireItem;
  qrItem: QuestionnaireResponseItem;
}

function QItemChoiceSelectAnswerOption(props: Props) {
  const { qItem, qrItem, repeats, onQrItemChange } = props;

  const qrChoiceSelect = qrItem ? qrItem : QuestionnaireResponseService.createQrItem(qItem);
  const valueSelect = getQrChoiceValue(qrChoiceSelect);

  function handleChange(e: SelectChangeEvent) {
    if (qItem.answerOption) {
      const qrAnswer = findInAnswerOptions(qItem.answerOption, e.target.value);
      if (qrAnswer) {
        onQrItemChange({ ...qrChoiceSelect, answer: [qrAnswer] });
      }
    }
  }

  const choiceSelectAnswerOption = (
    <Select id={qItem.id} name={qItem.text} value={valueSelect} onChange={handleChange}>
      {qItem.answerOption?.map((option) => {
        if (option['valueCoding']) {
          return (
            <MenuItem key={option.valueCoding.display} value={option.valueCoding.code}>
              {option.valueCoding.display}
            </MenuItem>
          );
        } else if (option['valueString']) {
          return (
            <MenuItem key={option.valueString} value={option.valueString}>
              {option.valueString}
            </MenuItem>
          );
        } else if (option['valueInteger']) {
          return (
            <MenuItem key={option.valueInteger} value={option.valueInteger.toString()}>
              {option.valueInteger}
            </MenuItem>
          );
        }
      })}
    </Select>
  );

  const renderQItemChoiceSelectAnswerOption = repeats ? (
    <Container>{choiceSelectAnswerOption}</Container>
  ) : (
    <FormControl>
      <Grid container spacing={4}>
        <Grid item xs={5}>
          <Typography>{qItem.text}</Typography>
        </Grid>
        <Grid item xs={7}>
          <Container>{choiceSelectAnswerOption}</Container>
        </Grid>
      </Grid>
    </FormControl>
  );
  return <div>{renderQItemChoiceSelectAnswerOption}</div>;
}

export default QItemChoiceSelectAnswerOption;
