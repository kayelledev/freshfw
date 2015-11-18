class Review < ActiveRecord::Base
  belongs_to :user
  belongs_to :product
  validates :user_id, :uniqueness => { :scope => :product_id,
    :message => "Users may only write one review per product." }
  scope :last_monthly_data, -> { where('updated_at > ? ', Time.zone.today - 31.days).order('updated_at DESC')} 
end
