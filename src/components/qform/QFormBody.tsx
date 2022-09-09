import React from 'react';
import Container from '@mui/material/Container';
import { Typography } from '@mui/material';
import { QuestionnaireItem } from '../questionnaire/QuestionnaireModel';
import { QuestionnaireResponseItem } from '../questionnaireResponse/QuestionnaireResponseModel';
import QItemGroup from './qform-items/QItemGroup';
import { PropsWithQrItemChangeHandler, QItemType } from './FormModel';
import { QuestionnaireResponseService } from '../questionnaireResponse/QuestionnaireResponseService';
import { getQrItemsIndex, mapQItemsIndex } from './IndexFunctions';

interface Props extends PropsWithQrItemChangeHandler<QuestionnaireResponseItem> {
  qForm: QuestionnaireItem;
  qrForm: QuestionnaireResponseItem;
}

function QFormBody(props: Props) {
  const { qForm, qrForm, onQrItemChange } = props;
  const indexMap: Record<string, number> = mapQItemsIndex(qForm);

  function handleQrGroupChange(qrItem: QuestionnaireResponseItem) {
    QuestionnaireResponseService.updateLinkedItem(qrItem, qrForm, indexMap);
    onQrItemChange(qrForm);
  }

  const qFormItems = qForm.item;
  const qrFormItems = qrForm.item;

  if (qFormItems && qrFormItems) {
    const qrFormItemsByIndex = getQrItemsIndex(qFormItems, qrFormItems);

    return (
      <div>
        <Container>
          <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
            {qForm.text}
          </Typography>
          {qFormItems.map((qItem: QuestionnaireItem, i) => {
            const qrItem = qrFormItemsByIndex[i];
            if (qItem.type === QItemType.Group) {
              return (
                <QItemGroup
                  key={qItem.linkId}
                  qItem={qItem}
                  qrItem={qrItem}
                  repeats={false}
                  onQrItemChange={handleQrGroupChange}></QItemGroup>
              );
            } else {
              // TODO add switcher
              return null;
            }
          })}
        </Container>
      </div>
    );
  } else {
    return <div>Unable to load form</div>;
  }
}

export default QFormBody;
