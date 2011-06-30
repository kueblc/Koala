class User < ActiveRecord::Base
	validates :username, :presence => true
	validates :username, :uniqueness => true
	validates :password, :presence => true
	validates :email, :presence => true
	validates :join_date, :presence => true
end
