@0xdbb9ad1f14bf0b36;

struct Person {
  name @0 :Text;
  email @1 :Text;
  phones @2 :List(PhoneNumber);

  struct PhoneNumber {
    number @0 :Text;
    type @1 :Type;

    enum Type {
      mobile @0;
      home @1;
      work @2;
    }
  }

  employment :union {
    unemployed @3 :Void;
    employer @4 :Text;
    school @5 :Text;
    selfEmployed @6 :Void;
  }
}

struct AddressBook {
  people @0 :List(Person);
}
