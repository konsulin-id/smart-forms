import {
  Coding,
  QuestionnaireItem,
  QuestionnaireItemAnswerOption,
  QuestionnaireResponseItem,
  QuestionnaireResponseItemAnswer
} from 'fhir/r5';
import { CheckBoxOptionType, QItemOpenChoiceControl } from '../interfaces/Enums';
import { isSpecificItemControl } from './ItemControlFunctions';
import { findInAnswerOptions, findInAnswerValueSetCodings } from './ChoiceFunctions';

/**
 * Update open-choice checkbox group answers based on checkbox changes
 *
 * @author Sean Fong
 */
export function updateQrOpenChoiceCheckboxAnswers(
  changedOptionAnswer: string | null,
  changedOpenLabelAnswer: string | null,
  answers: QuestionnaireResponseItemAnswer[],
  answerOptions: QuestionnaireItemAnswerOption[] | Coding[],
  qrChoiceCheckbox: QuestionnaireResponseItem,
  checkboxOptionType: CheckBoxOptionType,
  isMultiSelection: boolean
): QuestionnaireResponseItem | null {
  if (changedOptionAnswer) {
    const newAnswer =
      checkboxOptionType === CheckBoxOptionType.AnswerOption
        ? findInAnswerOptions(answerOptions, changedOptionAnswer)
        : findInAnswerValueSetCodings(answerOptions, changedOptionAnswer);
    if (!newAnswer) return null;

    if (isMultiSelection && answers.length > 0) {
      // check if new answer exists in existing answers
      const newAnswerInAnswers =
        checkboxOptionType === CheckBoxOptionType.AnswerOption
          ? findInAnswerOptions(answers, changedOptionAnswer)
          : findInAnswerValueSetCodings(answers, changedOptionAnswer);

      if (newAnswerInAnswers) {
        // remove new answer from qrAnswers
        const newAnswers = [...answers].filter(
          (answer) => JSON.stringify(answer) !== JSON.stringify(newAnswerInAnswers)
        );
        return { ...qrChoiceCheckbox, answer: newAnswers };
      } else {
        // add new answer to qrAnswers
        return { ...qrChoiceCheckbox, answer: [...answers, newAnswer] };
      }
    } else {
      return answers.some((answer) => JSON.stringify(answer) === JSON.stringify(newAnswer))
        ? { ...qrChoiceCheckbox, answer: [] }
        : { ...qrChoiceCheckbox, answer: [newAnswer] };
    }
  } else if (changedOpenLabelAnswer) {
    const newOpenLabelAnswer = { valueString: changedOpenLabelAnswer };
    const oldOpenLabelAnswer: QuestionnaireResponseItemAnswer | null = getOldOpenLabelAnswer(
      answers,
      answerOptions
    );

    if (answers.length === 0) {
      return { ...qrChoiceCheckbox, answer: [newOpenLabelAnswer] };
    }

    if (isMultiSelection) {
      if (!oldOpenLabelAnswer) {
        // append newOpenLabel if oldOpenLabel doesnt exist
        return { ...qrChoiceCheckbox, answer: [...answers, newOpenLabelAnswer] };
      } else {
        // An oldOpenLabel already exists
        // Remove oldOpenLabel from answers
        const answersWithoutOpenLabel = [...answers].filter(
          (answer) => JSON.stringify(answer) !== JSON.stringify(oldOpenLabelAnswer)
        );

        if (JSON.stringify(newOpenLabelAnswer) === JSON.stringify(oldOpenLabelAnswer)) {
          // User unchecks openLabel checkbox
          return { ...qrChoiceCheckbox, answer: answersWithoutOpenLabel };
        } else {
          // User changes openLabel value
          return { ...qrChoiceCheckbox, answer: [...answersWithoutOpenLabel, newOpenLabelAnswer] };
        }
      }
    } else {
      if (!oldOpenLabelAnswer || newOpenLabelAnswer !== oldOpenLabelAnswer) {
        // set newOpenLabel as sole answer if oldOpenLabel doesnt exist OR if user changed openLabel value
        return { ...qrChoiceCheckbox, answer: [newOpenLabelAnswer] };
      } else {
        // User unchecks openLabel checkbox
        return { ...qrChoiceCheckbox, answer: [] };
      }
    }
  } else {
    // Default condition which will not happen
    return { ...qrChoiceCheckbox };
  }
}

export function getOldOpenLabelAnswer(
  answers: QuestionnaireResponseItemAnswer[],
  options: QuestionnaireItemAnswerOption[]
): QuestionnaireResponseItemAnswer | null {
  const openLabelAnswers = answers.filter((answer) => options.indexOf(answer) === -1);
  return openLabelAnswers.length > 0 ? openLabelAnswers[0] : null;
}

/**
 * Get openChoice control type from qItem
 * defaults to select if no control code is provided
 *
 * @author Sean Fong
 */
export function getOpenChoiceControlType(qItem: QuestionnaireItem) {
  if (isSpecificItemControl(qItem, 'autocomplete')) {
    return QItemOpenChoiceControl.Autocomplete;
  } else if (isSpecificItemControl(qItem, 'check-box')) {
    return QItemOpenChoiceControl.Checkbox;
  } else {
    return QItemOpenChoiceControl.Select;
  }
}

/**
 * Get string label from given answerOption
 *
 * @author Sean Fong
 */
export function getAnswerOptionLabel(option: QuestionnaireItemAnswerOption | string): string {
  if (typeof option === 'string') {
    return option;
  }

  if (option['valueCoding']) {
    return `${option.valueCoding.display}`;
  } else if (option['valueString']) {
    return option.valueString;
  } else if (option['valueInteger']) {
    return option.valueInteger.toString();
  } else {
    return '';
  }
}
