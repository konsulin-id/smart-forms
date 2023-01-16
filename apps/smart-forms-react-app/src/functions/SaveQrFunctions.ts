import {
  Patient,
  Practitioner,
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireResponse,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import Client from 'fhirclient/lib/Client';
import { constructName } from './LaunchContextFunctions';
import dayjs from 'dayjs';
import { qrToHTML } from './PreviewFunctions';
import { hideQItem } from './QItemFunctions';

/**
 * Sends a request to client CMS to write back a completed questionnaireResponse
 *
 * @author Sean Fong
 */
export async function saveQuestionnaireResponse(
  client: Client,
  patient: Patient,
  user: Practitioner,
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): Promise<QuestionnaireResponse> {
  const headers = {
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/json+fhir; charset=UTF-8'
  };

  let requestUrl = 'QuestionnaireResponse';
  let method = 'POST';
  let questionnaireResponseBody: QuestionnaireResponse = { ...questionnaireResponse };

  if (questionnaireResponse.id) {
    requestUrl += '/' + questionnaireResponse.id;
    method = 'PUT';
  } else {
    questionnaireResponseBody = {
      ...questionnaireResponse,
      text: {
        status: 'generated',
        div: qrToHTML(questionnaire, questionnaireResponse)
      },
      subject: {
        reference: `Patient/${patient.id}`,
        type: 'Patient',
        display: constructName(patient.name)
      },
      author: {
        reference: `Practitioner/${user.id}`,
        type: 'Practitioner',
        display: constructName(user.name)
      },
      authored: dayjs().format()
    };
  }

  questionnaireResponseBody = removeHiddenAnswers(questionnaire, questionnaireResponseBody);

  return client.request({
    url: requestUrl,
    method: method,
    body: JSON.stringify(questionnaireResponseBody),
    headers: headers
  });
}

export function removeHiddenAnswers(
  questionnaire: Questionnaire,
  questionnaireResponse: QuestionnaireResponse
): QuestionnaireResponse {
  const questionnaireItem = questionnaire.item;
  const questionnaireResponseItem = questionnaireResponse.item;
  if (
    !questionnaireItem ||
    questionnaireItem.length === 0 ||
    !questionnaireResponseItem ||
    questionnaireResponseItem.length === 0
  ) {
    return questionnaireResponse;
  }

  questionnaireResponseItem.forEach((qrItem, i) => {
    const qItem = questionnaireItem[i];
    const newQrForm = readQuestionnaireResponseItem(qItem, qrItem);
    if (newQrForm && questionnaireResponse.item) {
      questionnaireResponse.item[i] = { ...newQrForm };
    }
  });

  return questionnaireResponse;
}

function readQuestionnaireResponseItem(
  qItem: QuestionnaireItem,
  qrItem: QuestionnaireResponseItem
): QuestionnaireResponseItem | null {
  const qItems = qItem.item;
  if (qItems && qItems.length > 0) {
    if (hideQItem(qItem)) return null;

    const qrItems = qrItem.item;
    const qrAnswerItems = qrItem.answer;
    if (qrItems && qrItems.length > 0) {
      const newQrItems: QuestionnaireResponseItem[] = [];
      for (let i = 0, j = 0; i < qItems.length; i++) {
        if (qrItems[j] && qItems[i].linkId === qrItems[j].linkId) {
          const newQrItem = readQuestionnaireResponseItem(qItems[i], qrItems[j]);
          if (newQrItem) {
            newQrItems.push(newQrItem);
          }
          j++;
        }
      }
      return { ...qrItem, item: newQrItems };
    } else if (qrAnswerItems && qrAnswerItems.length > 0 && qrAnswerItems[0].item) {
      const newQrAnswers: QuestionnaireResponseItemAnswer[] = [];
      for (let a = 0; a < qrAnswerItems.length; a++) {
        const repeatAnswer = qrAnswerItems[a];
        const newRepeatAnswerItems: QuestionnaireResponseItem[] = [];

        if (repeatAnswer && repeatAnswer.item && repeatAnswer.item.length > 0) {
          for (let i = 0, j = 0; i < qItems.length; i++) {
            if (repeatAnswer.item[j] && qItems[i].linkId === repeatAnswer.item[j].linkId) {
              const newQrItem = readQuestionnaireResponseItem(qItems[i], repeatAnswer.item[j]);
              if (newQrItem) {
                newRepeatAnswerItems.push(newQrItem);
              }
              j++;
            }
          }
        }

        newQrAnswers.push({ ...repeatAnswer, item: newRepeatAnswerItems });
      }
      return { ...qrItem, answer: newQrAnswers };
    }
    return qrItem;
  }

  return hideQItem(qItem) ? null : { ...qrItem };
}
