class SwitchDeviseToShoppeUsers < ActiveRecord::Migration
  def up
    add_column :shoppe_users, :encrypted_password, :string, null: false, default: ""

      ## Recoverable
    add_column :shoppe_users, :reset_password_token, :string
    add_column :shoppe_users, :reset_password_sent_at, :datetime

      ## Rememberable
    add_column :shoppe_users, :remember_created_at, :datetime

      ## Confirmable
    add_column :shoppe_users, :confirmation_token, :string
    add_column :shoppe_users, :confirmed_at, :datetime
    add_column :shoppe_users, :confirmation_sent_at, :datetime
    add_column :shoppe_users, :unconfirmed_email, :string

    add_column :shoppe_users, :twitter, :string
    add_column :shoppe_users, :facebook, :string
  end

  def down
    remove_column :shoppe_users, :encrypted_password

      ## Recoverable
    remove_column :shoppe_users, :reset_password_token
    remove_column :shoppe_users, :reset_password_sent_at

      ## Rememberable
    remove_column :shoppe_users, :remember_created_at

      ## Confirmable
    remove_column :shoppe_users, :confirmation_token
    remove_column :shoppe_users, :confirmed_at
    remove_column :shoppe_users, :confirmation_sent_at
    remove_column :shoppe_users, :unconfirmed_email

    remove_column :shoppe_users, :twitter
    remove_column :shoppe_users, :facebook
  end
end
