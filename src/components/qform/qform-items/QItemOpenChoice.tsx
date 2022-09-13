import React from 'react';
import { Checkbox } from '@mui/material';
import { QuestionnaireItem } from 'fhir/r5';

interface Props {
  item: QuestionnaireItem;
}

function QItemGroup(props: Props) {
  const { item } = props;
  return (
    <div>
      OpenChoice
      <Checkbox id={item.linkId} />
      <Checkbox id={item.linkId} />
      <Checkbox id={item.linkId} />
    </div>
  );
}

export default QItemGroup;
