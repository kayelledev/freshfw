class User < Shoppe::User

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :confirmable,
         :omniauthable

  def self.build_with_auth_data(auth_data, params)
    password = Devise.friendly_token.first(8)
    first_name = auth_data['info']['name'].split[0]
    last_name = auth_data['info']['name'].split[1]


    user = self.new(email: params.try(:[], "user").try(:[], "email") || auth_data['info']['email'],
             :first_name => first_name, :last_name => last_name,
             :password => password ,
             :password_confirmation => password,
             auth_data['provider'] => auth_data['uid']
            )
  end

  def fullname
   first_name + ' ' + last_name
  end

  alias_attribute :email, :email_address
  alias_attribute :email=, :email_address=
  alias_attribute :email_changed?, :email_address_changed?

end
