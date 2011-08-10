class User < ActiveRecord::Base
  has_many :comments
  has_many :projects
  
  validates :name, :presence => true
  validates :hashed_password, :presence => true
  validates :email, :presence => true
  validates :skin_preference, :presence => true
  validates :date_joined, :presence => true
end
