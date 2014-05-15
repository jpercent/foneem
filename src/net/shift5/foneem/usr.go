package main

import (
    "encoding/json"
    "log"
)
 
type Usr struct {
	name string
	email string
}
 
func DecodeUsr(encodedUsr []byte) Usr {
    var decodedUsr Usr
    json.Unmarshal(encodedUsr, &decodedUsr)
    return decodedUsr
}

func EncodeUsr(decodedUsr Usr) []byte {
    encodedUsr, err := json.Marshal(&decodedUsr)
    if err != nil {
        log.Fatalln(err)
    }
    return encodedUsr
}
