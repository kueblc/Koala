require 'Digest'

class UsersController < ApplicationController
  
  def new
    @user = User.new
  end
  
  def edit
    @user = User.find(params[:id])
  end
  
  def create
    @user = User.new(params[:user])
    @user.skin_preference = 'Default'
    @user.date_joined = Time.now
    @user.hashed_password = Digest::SHA1.hexdigest(@user.password)
    if @user.save
      redirect_to :home, :notice => "<div class='success'>Account created!</div>"
    else
      redirect_to new_user_path, :notice => error_listing(@user)
    end
  end
  
  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      redirect_to :home, :notice => "<div class='success'>Logged in</div>"
    else
      redirect_to edit_user_path, :notice => error_listing(@user)
    end
  end
  
end
