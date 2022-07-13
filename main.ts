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
    export enum temppin {
        //% block=pin0
        pin0 = 0,
        //% block=pin1
        pin1 = 1,
        //% block=pin2
        pin2 = 2,
        //% block=pin5
        pin5 = 5,
        //% block=pin8
        pin8 = 8,
        //% block=pin11
        pin11 = 11,
        //% block=pin12
        pin12 = 12,
        //% block=pin13
        pin13 = 13,
        //% block=pin14
        pin14 = 14,
        //% block=pin15
        pin15 = 15,
        //% block=pin16
        pin16 = 16
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
}
