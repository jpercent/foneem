package main

import (
	"io"
	"net/http"
	"log"
)

// hello world, the web server
func Foneem(w http.ResponseWriter, req *http.Request) {
	io.WriteString(w, "hello, world!\n")
}

func GetUsers(w http.ResponseWriter, req *http.Request) {

}

func main() {
	http.HandleFunc("/hello", Foneem)
	http.HandleFunc("/usr/", GetUsers)
	
	err := http.ListenAndServe(":20226", nil)
	if err != nil {
		log.Fatal("Server failed to start: ", err)
	}
}


