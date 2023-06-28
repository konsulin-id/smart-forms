/*
 * Copyright 2023 Commonwealth Scientific and Industrial Research
 * Organisation (CSIRO) ABN 41 687 119 230.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Coding, QuestionnaireItem } from 'fhir/r4';
import { hasHiddenExtension, isSpecificItemControl } from './itemControl.ts';
import type { EnableWhenItems } from '../../enableWhen/types/enableWhen.interface.ts';
import type { Tabs } from '../types/tab.interface.ts';

/**
 * Checks if any of the items in a qItem array is a tabbed item
 * Returns true if there is at least one tabbed item
 *
 * @author Sean Fong
 */
export function containsTabs(topLevelQItem: QuestionnaireItem): boolean {
  if (!topLevelQItem.item) {
    return false;
  }

  const tabs = getTabbedItems(topLevelQItem.item);
  return tabs.length > 0;
}

/**
 * Checks if a top-level QItem is a tab container
 * All items within a tab container are tabbed items
 *
 * @author Sean Fong
 */
export function isTabContainer(topLevelQItem: QuestionnaireItem): boolean {
  return isSpecificItemControl(topLevelQItem, 'tab-container');
}

/**
 * Get tabbed items from a qItem array
 *
 * @author Sean Fong
 */
export function getTabbedItems(items: QuestionnaireItem[]): QuestionnaireItem[] {
  return items.filter((i: QuestionnaireItem) => isTab(i));
}

/**
 * Check if a qItem is a tabbed item
 *
 * @author Sean Fong
 */
export function isTab(item: QuestionnaireItem) {
  const itemControl = item.extension?.find(
    (e) => e.url === 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl'
  );

  if (itemControl) {
    const tabCoding = itemControl.valueCodeableConcept?.coding?.find(
      (c: Coding) => c.code === 'tab'
    );
    if (tabCoding) {
      return true;
    }
  }
  return false;
}

/**
 * Create a <linkId, {isComplete: boolean}> key-value pair for all tabbed items in a qItem array
 *
 * @author Sean Fong
 */
export function constructTabsWithProperties(
  qItems: QuestionnaireItem[] | undefined,
  hasTabContainer: boolean
): Tabs {
  if (!qItems) return {};

  const qItemTabs = hasTabContainer ? qItems : qItems.filter(isTab);

  const tabs: Tabs = {};
  for (const [i, qItem] of qItemTabs.entries()) {
    tabs[qItem.linkId] = {
      tabIndex: i,
      isComplete: false,
      isHidden: hasHiddenExtension(qItem)
    };
  }
  return tabs;
}

export function constructTabsWithVisibility(
  tabs: Tabs,
  enableWhenItems: EnableWhenItems
): { linkId: string; isVisible: boolean }[] {
  return Object.entries(tabs).map(([linkId]) => {
    return {
      linkId,
      isVisible: enableWhenItems[linkId] ? enableWhenItems[linkId]?.isEnabled : true
    };
  });
}

/**
 * Get index of next visible tab
 *
 * @author Sean Fong
 */
export function getNextVisibleTabIndex(
  tabs: Tabs,
  currentTabIndex: number,
  enableWhenItems: EnableWhenItems
): number {
  const tabsWithVisibility = constructTabsWithVisibility(tabs, enableWhenItems);

  let nextTabIndex = currentTabIndex + 1;
  const nextTabIndexIsVisible = false;
  while (!nextTabIndexIsVisible) {
    if (tabsWithVisibility[nextTabIndex].isVisible) {
      return nextTabIndex;
    }
    nextTabIndex++;
  }

  return nextTabIndex;
}
/**
 *
 * Get index of first visible tab
 *
 * @author Sean Fong
 */
export function getFirstVisibleTabIndex(
  tabs: Tabs,
  enableWhenItems: EnableWhenItems
): number | undefined {
  const tabsWithVisibility = constructTabsWithVisibility(tabs, enableWhenItems);
  return tabsWithVisibility.findIndex((tab) => tab.isVisible);
}

/**
 *
 * Find number of visible tabs
 *
 * @author Sean Fong
 */
export function findNumOfVisibleTabs(tabs: Tabs, enableWhenItems: EnableWhenItems): number {
  const tabsWithVisibility = constructTabsWithVisibility(tabs, enableWhenItems);
  return tabsWithVisibility.filter((tab) => tab.isVisible).length;
}
