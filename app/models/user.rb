class User < ActiveRecord::Base

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :confirmable,
         :omniauthable


  def fullname
   first_name + ' ' + last_name
  end
end
