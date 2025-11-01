module vendor3::suins_util{
    use suins::subdomain_registration::{SubDomainRegistration};
    use suins::suins_registration::{SuinsRegistration};
    use std::macros::range_do;
    use std::string::{Self, String, utf8};

    public fun decompose_org_vector(self: &vector<String>): vector<String> {
        let mut result = vector::empty<String>();
        range_do!(0, self.length(), |i| {
            let domain_name = self.borrow(i);
            let labels = split_by_dot(*domain_name);
            result.push_back(*labels.borrow(1));
        });
        result
    }

    public fun decompose_role_vector(self: &vector<String>): vector<String> {
        let mut result = vector::empty<String>();
        range_do!(0, self.length(), |i| {
            let domain_name = self.borrow(i);
            let labels = split_by_dot(*domain_name);
            result.push_back(*labels.borrow(0));
        });
        result
    }

    fun split_by_dot(mut s: String): vector<String> {
        let dot = utf8(b".");
        let mut parts: vector<String> = vector[];
        while (!s.is_empty()) {
            let index_of_next_dot = s.index_of(&dot);
            let part = s.sub_string(0, index_of_next_dot);
            parts.push_back(part);

            let len = s.length();
            let start_of_next_part = if (index_of_next_dot == len) {
                len
            } else {
                index_of_next_dot + 1
            };

            s = s.sub_string(start_of_next_part, len);
        };

        parts
    }
}