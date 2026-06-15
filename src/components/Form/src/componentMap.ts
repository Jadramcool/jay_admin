import { NInput, NInputNumber, NSelect, NCheckbox, NCheckboxGroup, NRadioGroup, NSwitch, NDatePicker, NTimePicker, NTreeSelect, NTransfer } from 'naive-ui';
import ApiSelect from './components/ApiSelect.vue';
import ApiTreeSelect from './components/ApiTreeSelect.vue';
import ApiTree from './components/ApiTree.vue';
import IconPicker from './components/IconPicker.vue';
import RadioButtonGroup from './components/RadioButtonGroup.vue';

const componentMap = new Map<string, any>();

componentMap.set('NInput', NInput);
componentMap.set('NInputNumber', NInputNumber);
componentMap.set('NSelect', NSelect);
componentMap.set('NCheckbox', NCheckbox);
componentMap.set('NCheckboxGroup', NCheckboxGroup);
componentMap.set('NRadioGroup', NRadioGroup);
componentMap.set('NSwitch', NSwitch);
componentMap.set('NDatePicker', NDatePicker);
componentMap.set('NTimePicker', NTimePicker);
componentMap.set('NTreeSelect', NTreeSelect);
componentMap.set('NTransfer', NTransfer);
componentMap.set('ApiSelect', ApiSelect);
componentMap.set('ApiTreeSelect', ApiTreeSelect);
componentMap.set('ApiTree', ApiTree);
componentMap.set('IconPicker', IconPicker);
componentMap.set('RadioButtonGroup', RadioButtonGroup);

export { componentMap };
