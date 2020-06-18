import GSBoolean from './value-boolean';
import GSValue from './class-value';

class GSString extends GSValue {
  constructor(initial = '') {
    super();
    this.value = initial;
  }
  setTo(str) {
    this.value = str;
    return this;
  }
  isEq(str) {
    return new GSBoolean(this.value === str);
  }
}

export default GSString;
