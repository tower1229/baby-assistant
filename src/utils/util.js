
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: (date) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    // const hour = date.getHours()
    // const minute = date.getMinutes()
    // const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('-') 
  },
  formatTableData: txt => {
    let table = txt.split('\r');
    table.shift();
    table = table.map(e => {
      return e.replace(/\s/g, ' ').trim().split(' ').slice(4).map(e => parseFloat(e))
    })
    return table;
  },
  computeDays: birthday => {
    const birthDate = new Date(birthday)
    const nowDate = new Date();
    const days = Math.floor((nowDate.getTime() - birthDate.getTime()) / (24 * 3600 * 1000))
    return days
  },
  formatDays: (birthday, today) => {
    if (!birthday){
      return ''
    }
    const birthDate = new Date(birthday)
    const birthYear = birthDate.getFullYear();
    const birthMonth = birthDate.getMonth();
    const birthDay = birthDate.getDate();

    const nowDate = today ? new Date(today) : new Date();
    const nowYear = nowDate.getFullYear();
    const nowMonth = nowDate.getMonth();
    const nowDay = nowDate.getDate();

    let babyYears = 0;
    let babyMonth = 0;
    let babyDays = 0;

    let yearDistance = nowYear - birthYear;
    if (yearDistance>=1){
      if (nowMonth > birthMonth || (nowMonth === birthMonth && (nowDay >= birthDay))){
        babyYears = yearDistance
      } else {
        babyYears = yearDistance - 1
      }
    }
    
    if (babyYears > 0){
      birthDate.setFullYear(birthYear + babyYears)
    }

    const days = Math.floor((nowDate.getTime() - birthDate.getTime()) / (24 * 3600 * 1000))
    babyMonth = Math.floor(days / 30)
    babyDays = days % 30
    
    return `${babyYears > 0 ? babyYears +'岁' : ''}${babyMonth}个月零${babyDays}天`
  },
  computePercent: (value, data) => {
    const percentLevels = [0.1, 1, 3, 5, 10, 15, 25, 50, 75, 85, 90, 95, 97, 99, 99.9];
    const centerIndex = 7;
    let percent;
    if (value == data[centerIndex]) {
      percent = 50
    } else if (value < data[centerIndex]) {
      //小于中位数
      let levelIndex;
      
      for (let i = centerIndex; i > 0; i--){
        if (value > data[i-1]){
          levelIndex = i-1;
          break;
        }
      }
      if (levelIndex){
        let extPercent = parseInt((value - data[levelIndex]) / (data[levelIndex + 1] - data[levelIndex]) * 100) / 100 * (percentLevels[levelIndex + 1] - percentLevels[levelIndex])

        percent = percentLevels[levelIndex] + extPercent;
      }else{
        percent = 0
      }
      
    } else {
      //大于中位数
      let levelIndex;
      for (let i = centerIndex; i < percentLevels.length-1; i++) {
        if (value < data[i+1]) {
          levelIndex = i;
          break;
        }
      }
      if (levelIndex){
        let extPercent = parseInt((value - data[levelIndex]) / (data[levelIndex + 1] - data[levelIndex]) * 100) / 100 * (percentLevels[levelIndex + 1] - percentLevels[levelIndex])

        percent = percentLevels[levelIndex] + extPercent;
      }else{
        percent = 99.9
      }
      
    }
    return parseInt(percent * 100) / 100
  },
  checkLegality: (type, value, middle) => {
    switch (type){
      case "weight": 
        if (value < middle/2 || value > middle * 2){
          return false
        }
        return true
      break;
      case "length": 
        if (value < middle / 2 || value > middle * 2) {
          return false
        }
        return true
      break;
      case "bmi":
        if (value < middle / 2 || value > middle * 2) {
          return false
        }
        return true
      break;
      default: 
        console.warn('type 异常')
        return true
    }
  },
  fix1: function(number){
    return parseInt(number * 10) / 10
  },
  fix2: function (number) {
    return parseInt(number * 100) / 100
  },
  checkData: function (baby) {
    if (!baby.birthday) {
      baby.birthday = this.data.today
    }
    if (!baby.gender) {
      baby.gender = '男'
    }
    return !!baby.weight && !!baby.length
  }
}
