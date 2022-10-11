// SensorPlus@KittenBotHK

//% color="#76dbb1" weight=10 icon="\uf2ce"
//% groups='["SensorPlus"]'
namespace SensorPlus {
let temp=25
let deltaU=0
let U=0
let U25=0
let K=0
let NTU=0
let x=0

let SerialData: Buffer = null
let SerialString=""
let serialBuf: string[] = []
let UTC=""
let longitude=""
let latitude=""

let DS1307_I2C_ADDR = 104;
let DS1307_REG_SECOND = 0
let DS1307_REG_MINUTE = 1
let DS1307_REG_HOUR = 2
let DS1307_REG_WEEKDAY = 3
let DS1307_REG_DAY = 4
let DS1307_REG_MONTH = 5
let DS1307_REG_YEAR = 6
let DS1307_REG_CTRL = 7
let DS1307_REG_RAM = 8

    export enum date_reg {
    //% block=year
    year = 6,
    //% block=month
    month = 5,
    //% block=day
    day = 4,
    //% block=weekday
    weekday = 3,
    //% block=hour
    hour = 2,
    //% block=minute
    minute = 1,
    //% block=second
    second = 0
    }

    export enum temppin {
        //% block=P0
        P0 = 0,
        //% block=P1
        P1 = 1,
        //% block=P2
        P2 = 2,
        //% block=pin5
        P5 = 5,
        //% block=pin8
        P8 = 8,
        //% block=pin11
        P11 = 11,
        //% block=pin12
        P12 = 12,
        //% block=pin13
        P13 = 13,
        //% block=pin14
        P14 = 14,
        //% block=pin15
        P15 = 15,
        //% block=pin16
        P16 = 16
        }

    export enum lensState {
        //% block=On
        on=1,
        //% block=Off
        off=0
    }

    //% blockId=ds18init block="Init Water Temp Pin %pin"
    //% group="Water Temperature Sensor" weight=100
    export function ds18init(pin: DigitalPin) {
        pins.setPull(pin, PinPullMode.PullUp)
    }

    //% shim=DS18B20::Temperature
    export function Temperature(p: number): number {
        return 0
    }

    //% blockId=temp block="Get Water Temperature Pin %p"
    //% group="Water Temperature Sensor" weight=99
    export function water_temp(p: temppin): number {
        temp=Math.round(Temperature(p)/10)
        while(temp>=85) {
            temp=Math.round(Temperature(p)/10)
            basic.pause(100)
            }
        return temp
    }

    //% shim=dstemp::celsius
    export function celsius(pin: DigitalPin) : number {
        return 32.6;
    }

    //% blockId=dstemp block="Get Water Temperature(Resistor) Pin %pin"
    //% group="Resistor Water Temperature Sensor" weight=99
    export function DSTemperature(pin: DigitalPin): number {
        temp=celsius(pin)
        while(temp>=85 || temp<=-300) {
            temp=celsius(pin)
            basic.pause(100)
            }

        return Math.round(temp)
    }

    //% blockId=calibrate block="Calibrate w/ Temp %t, Pin %pin"
    //% group="Turbidity Sensor" weight=98
    export function Calibrate(t: number, pin: AnalogPin) {
        temp = t
        x = pins.analogReadPin(pin)
        deltaU = -0.0192*(temp-25)
        U = x*5/1024
        U25 = U-deltaU
        K = 865.68*U25
    }

    //% blockId=calibrate_notemp block="Calibrate w/o Temp, Pin %pin"
    //% group="Turbidity Sensor" weight=97
    export function Calibrate_notemp(pin: AnalogPin) {
        x = pins.analogReadPin(pin)
        deltaU = -0.0192*(temp-25)
        U = x*5/1024
        U25 = U-deltaU
        K = 865.68*U25
    }
    //% blockId=get_ntu block="Get NTU Pin %pin"
    //% group="Turbidity Sensor" weight=96
    export function get_ntup(pin: AnalogPin):number {
        x = pins.analogReadPin(pin)
        U = x*5/1024
        NTU = (-865.68*U)+K
        if (NTU < 0){
            return 0
        } else {
            return NTU
        }
    }

    //% blockID=lens_set block="Sugar Lens Pin %pin ,Set %state"
    //% group="Sugar Lens FPV" weight=95
    export function lens_set(pin: DigitalPin, state: lensState){
        pins.digitalWritePin(pin,state)
    }

    export enum timeindex{
    //% block="Hour"
    hour=0,
    //% block="Minute"
    min=1,
    //% block="Second"
    sec=2,
    }
    /**
       * init serial port
       * @param tx Tx pin; eg: SerialPin.P1
       * @param rx Rx pin; eg: SerialPin.P2
       */
      //% blockId=gps_init block="GPS init|Tx(Blue) pin %tx|Rx(Green) pin %rx"
      //% group="GPS" weight=100
      export function gps_init(tx: SerialPin, rx: SerialPin): void {
        serial.redirect(tx, rx, BaudRate.BaudRate9600)
        serial.setRxBufferSize(72)
        basic.pause(100)
      }

      //% blockId=gps_read block="GPS Read Data"
      //% group="GPS" weight=95
      export function gps_read(){
      SerialString=''
      while (!SerialString.includes("GNGGA")){
        SerialData=serial.readBuffer(72)
        for (let i =0; i<=SerialData.length;i++){
          let temp = String.fromCharCode(SerialData[i])
          SerialString = SerialString + temp
        }
        basic.pause(100)
      }
      if (SerialString.includes("GNGGA")){
        serialBuf=SerialString.split(",")
      } else {
        serialBuf=[]
      }

      if (serialBuf.length>=4){
        UTC=serialBuf[1]
        latitude=serialBuf[2]
        longitude=serialBuf[4]
      }
      }

      //% blockId=gps_utc block="GPS get UTC Time %i"
      //% group="GPS" weight=85
      export function gps_utc(i:timeindex): number{
      if (UTC!=''){
      let time=[]
      time[0]=parseFloat(UTC.substr(0,2))
      time[0]=time[0]+8
      time[1]=parseFloat(UTC.substr(2,2))
      time[2]=parseFloat(UTC.substr(4,2))
      return time[i]
      }
      else return 0
      }

      //% blockID=gps_latitude block="GPS Get Latitude"
      //% group="GPS" weight=80
      export function gps_latitude():number{
      let latfinal = -1
      if (latitude!=''){
      latfinal=parseFloat(latitude.substr(0,2))+(parseFloat(latitude.substr(2,latitude.length)))/60
      latfinal= parseFloat((convertToText(latfinal).substr(0,8)))
      }
      return latfinal
      }

      //% blockID=gps_longitude block="GPS Get Longitude"
      //% group="GPS" weight=75
      export function gps_longitude():number{
      let lonfinal = -1
      if (longitude!=''){
      lonfinal=parseFloat(longitude.substr(0,3))+(parseFloat(longitude.substr(3,longitude.length)))/60
      lonfinal= parseFloat((convertToText(lonfinal).substr(0,8)))
      }
      return lonfinal
      }

     /**
     * set ds1307's reg
     */
    function setReg(reg: number, dat: number): void {
        let buf = pins.createBuffer(2);
        buf[0] = reg;
        buf[1] = dat;
        pins.i2cWriteBuffer(DS1307_I2C_ADDR, buf);
    }

    /**
     * get ds1307's reg
     */
    function getReg(reg: number): number {
        pins.i2cWriteNumber(DS1307_I2C_ADDR, reg, NumberFormat.UInt8BE);
        return pins.i2cReadNumber(DS1307_I2C_ADDR, NumberFormat.UInt8BE);
    }

    /**
     * convert a Hex data to Dec
     */
    function HexToDec(dat: number): number {
        return (dat >> 4) * 10 + (dat % 16);
    }

    /**
     * convert a Dec data to Hex
     */
    function DecToHex(dat: number): number {
        return Math.idiv(dat, 10) * 16 + (dat % 10)
    }

    /**
     * start ds1307 (go on)
     */
    //% blockId="DS1307_START" block="start"
    //% group="Clock Module" weight=74
    export function start() {
        let t = getSecond()
        setSecond(t & 0x7f)
    }

    /**
     * stop ds1307 (pause)
     */
    //% blockId="DS1307_STOP" block="pause"
    //% group="Clock Module" weight=73
    export function stop() {
        let t = getSecond()
        setSecond(t | 0x80)
    }

    /**
     * get Second
     */
    function getSecond(): number {
        return Math.min(HexToDec(getReg(DS1307_REG_SECOND)), 59)
    }

    /**
     * set Date and Time
     * @param year is the Year will be set, eg: 2022
     * @param month is the Month will be set, eg: 10
     * @param day is the Day will be set, eg: 15
     * @param weekday is the Weekday will be set, eg: 6
     * @param hour is the Hour will be set, eg: 16
     * @param minute is the Minute will be set, eg: 30
     * @param second is the Second will be set, eg: 0
     */
    //% blockId="DS1307_SET_DATETIME" block="set year %year|month %month|day %day|weekday %weekday|hour %hour|minute %minute|second %second"
    //% group="Clock Module" weight=72
    export function DateTime(year: number, month: number, day: number, weekday: number, hour: number, minute: number, second: number): void {
        let buf = pins.createBuffer(8);
        buf[0] = DS1307_REG_SECOND;
        buf[1] = DecToHex(second % 60);
        buf[2] = DecToHex(minute % 60);
        buf[3] = DecToHex(hour % 24);
        buf[4] = DecToHex(weekday % 8);
        buf[5] = DecToHex(day % 32);
        buf[6] = DecToHex(month % 13);
        buf[7] = DecToHex(year % 100);
        pins.i2cWriteBuffer(DS1307_I2C_ADDR, buf)
    }

    //% blockId="DS1307_GET_DATE" block="date %reg"
    //% group="Clock Module" weight=64
    export function getDate(reg: date_reg): number {
        if (reg == DS1307_REG_YEAR){
        return HexToDec(getReg(reg)) + 2000
        } else {
        return HexToDec(getReg(reg))
        }
    }
}
